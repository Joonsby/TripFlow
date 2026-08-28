package com.tripflow.account.service;

import com.tripflow.account.dto.passwordreset.PasswordResetPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetVerificationResponse;
import com.tripflow.account.exception.InvalidPasswordResetTokenException;
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
    private PhoneVerificationStore phoneVerificationStore;
    private PasswordResetTokenStore passwordResetTokenStore;
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        phoneVerificationStore = new PhoneVerificationStore();
        passwordResetTokenStore = new PasswordResetTokenStore();
        PhoneVerificationService phoneVerificationService = new PhoneVerificationService(null, phoneVerificationStore);
        passwordResetService = new PasswordResetService(
                userMapper,
                refreshTokenMapper,
                passwordEncoder,
                phoneVerificationService,
                passwordResetTokenStore
        );
    }

    @Test
    void verifiedUserCanResetPasswordOnlyOnce() {
        User user = new User();
        user.setUserId(7);
        user.setEmail("user@example.com");
        user.setPhoneNumber("01012345678");

        when(userMapper.findByEmail("user@example.com")).thenReturn(user);
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
}
