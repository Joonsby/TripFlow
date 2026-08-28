package com.tripflow.account.service;

import com.tripflow.account.dto.passwordreset.PasswordResetPhoneVerificationSendRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetRequest;
import com.tripflow.account.dto.passwordreset.PasswordResetVerificationResponse;
import com.tripflow.account.exception.InvalidPasswordResetTokenException;
import com.tripflow.account.exception.PasswordConfirmationMismatchException;
import com.tripflow.account.exception.PhoneVerificationTargetMismatchException;
import com.tripflow.account.verification.PasswordResetTokenStore;
import com.tripflow.account.verification.PhoneVerificationPurpose;
import com.tripflow.auth.token.RefreshTokenMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final PhoneVerificationService phoneVerificationService;
    private final PasswordResetTokenStore passwordResetTokenStore;

    public void sendVerificationCode(PasswordResetPhoneVerificationSendRequest request) {
        User user = findUser(request.email(), request.phoneNumber());
        phoneVerificationService.send(user.getPhoneNumber(), PhoneVerificationPurpose.RESET_PASSWORD);
    }

    public PasswordResetVerificationResponse verifyCode(PasswordResetPhoneVerificationVerifyRequest request) {
        User user = findUser(request.email(), request.phoneNumber());
        phoneVerificationService.verify(
                user.getPhoneNumber(),
                request.code(),
                PhoneVerificationPurpose.RESET_PASSWORD
        );

        String resetToken = passwordResetTokenStore.issue(user.getUserId());
        return new PasswordResetVerificationResponse(resetToken, PasswordResetTokenStore.TOKEN_TTL_SECONDS);
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        if (!request.newPassword().equals(request.newPasswordConfirm())) {
            throw new PasswordConfirmationMismatchException();
        }

        Integer userId = passwordResetTokenStore.consume(request.resetToken());
        if (userId == null) {
            throw new InvalidPasswordResetTokenException();
        }

        String passwordHash = passwordEncoder.encode(request.newPassword());
        if (userMapper.updatePassword(userId, passwordHash) != 1) {
            throw new IllegalStateException("비밀번호 초기화에 실패했습니다.");
        }

        refreshTokenMapper.deleteAllByUserId(userId);
    }

    private User findUser(String email, String phoneNumber) {
        User user = userMapper.findByEmail(email.trim().toLowerCase(Locale.ROOT));
        if (user == null || !user.getPhoneNumber().equals(phoneNumber.trim())) {
            throw new PhoneVerificationTargetMismatchException();
        }
        return user;
    }
}
