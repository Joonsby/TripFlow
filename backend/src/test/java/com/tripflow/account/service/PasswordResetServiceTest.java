package com.tripflow.account.service;

import com.tripflow.account.dto.passwordreset.EmailVerificationSendRequest;
import com.tripflow.account.dto.passwordreset.EmailVerificationVerifyRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetVerificationResponse;
import com.tripflow.account.exception.InvalidPasswordResetTokenException;
import com.tripflow.account.exception.SamePasswordException;
import com.tripflow.account.verification.EmailSender;
import com.tripflow.account.verification.EmailVerificationStore;
import com.tripflow.account.verification.PasswordResetTokenStore;
import com.tripflow.account.verification.PhoneVerificationPurpose;
import com.tripflow.account.verification.PhoneVerificationStore;
import com.tripflow.auth.token.RefreshTokenMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserMapper userMapper;
    @Mock
    private RefreshTokenMapper refreshTokenMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailSender emailSender;
    private PhoneVerificationStore phoneVerificationStore;
    private EmailVerificationStore emailVerificationStore;
    private PasswordResetTokenStore passwordResetTokenStore;
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        phoneVerificationStore = new PhoneVerificationStore();
        emailVerificationStore = new EmailVerificationStore();
        passwordResetTokenStore = new PasswordResetTokenStore();
        PhoneVerificationService phoneVerificationService = new PhoneVerificationService(null, phoneVerificationStore);
        passwordResetService = new PasswordResetService(
                userMapper,
                refreshTokenMapper,
                passwordEncoder,
                phoneVerificationService,
                passwordResetTokenStore,
                emailSender,
                emailVerificationStore
        );
    }

    @Test
    void verifiedEmailIssuesPasswordResetToken() {
        User user = new User();
        user.setUserId(7);
        user.setEmail("user@example.com");

        when(userMapper.findByEmail("user@example.com")).thenReturn(user);

        passwordResetService.sendEmailVerificationCode(new EmailVerificationSendRequest("user@example.com"));
        String code = emailVerificationStore.getCode("user@example.com");
        PasswordResetVerificationResponse response = passwordResetService.verifyEmailVerificationCode(
                new EmailVerificationVerifyRequest("user@example.com", code)
        );

        verify(emailSender).sendVerificationCode("user@example.com", code);
        assertEquals(PasswordResetTokenStore.TOKEN_TTL_SECONDS, response.expiresIn());
        assertThrows(
                IllegalStateException.class,
                () -> passwordResetService.verifyEmailVerificationCode(
                        new EmailVerificationVerifyRequest("user@example.com", code)
                )
        );
    }

    @Test
    void verifiedUserCanResetPasswordOnlyOnce() {
        User user = new User();
        user.setUserId(7);
        user.setEmail("user@example.com");
        user.setPhoneNumber("01012345678");
        user.setPasswordHash("old-hash");

        when(userMapper.findByEmail("user@example.com")).thenReturn(user);
        when(userMapper.findById(7)).thenReturn(user);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-password");
        when(userMapper.updatePassword(7, "encoded-password")).thenReturn(1);

        phoneVerificationStore.save("01012345678", PhoneVerificationPurpose.RESET_PASSWORD, "123456");
        PasswordResetVerificationResponse verification = passwordResetService.verifyCode(
                new PasswordResetPhoneVerificationVerifyRequest("user@example.com", "01012345678", "123456")
        );

        assertEquals(PasswordResetTokenStore.TOKEN_TTL_SECONDS, verification.expiresIn());

        PasswordResetRequest request = new PasswordResetRequest(
                verification.resetToken(),
                "new-password",
                "new-password"
        );
        passwordResetService.resetPassword(request);

        verify(userMapper).updatePassword(7, "encoded-password");
        verify(refreshTokenMapper).deleteAllByUserId(7);
        assertThrows(InvalidPasswordResetTokenException.class, () -> passwordResetService.resetPassword(request));
    }

    @Test
    void sameAsCurrentPasswordIsRejectedAndKeepsToken() {
        User user = new User();
        user.setUserId(7);
        user.setEmail("user@example.com");
        user.setPhoneNumber("01012345678");
        user.setPasswordHash("old-hash");

        when(userMapper.findByEmail("user@example.com")).thenReturn(user);
        when(userMapper.findById(7)).thenReturn(user);
        when(passwordEncoder.matches("old-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-password");
        when(userMapper.updatePassword(7, "encoded-password")).thenReturn(1);

        phoneVerificationStore.save("01012345678", PhoneVerificationPurpose.RESET_PASSWORD, "123456");
        PasswordResetVerificationResponse verification = passwordResetService.verifyCode(
                new PasswordResetPhoneVerificationVerifyRequest("user@example.com", "01012345678", "123456")
        );

        assertThrows(
                SamePasswordException.class,
                () -> passwordResetService.resetPassword(
                        new PasswordResetRequest(verification.resetToken(), "old-password", "old-password")
                )
        );

        // 거절된 뒤에도 같은 토큰으로 다른 비밀번호를 저장할 수 있어야 한다.
        passwordResetService.resetPassword(
                new PasswordResetRequest(verification.resetToken(), "new-password", "new-password")
        );

        verify(userMapper).updatePassword(7, "encoded-password");
        verify(refreshTokenMapper).deleteAllByUserId(7);
    }
}
