package com.tripflow.account.service;

import com.tripflow.account.dto.passwordreset.*;
import com.tripflow.account.exception.InvalidPasswordResetTokenException;
import com.tripflow.account.exception.PasswordConfirmationMismatchException;
import com.tripflow.account.exception.PhoneVerificationTargetMismatchException;
import com.tripflow.account.verification.EmailSender;
import com.tripflow.account.verification.EmailVerificationStore;
import com.tripflow.account.verification.PasswordResetTokenStore;
import com.tripflow.account.verification.PhoneVerificationPurpose;
import com.tripflow.auth.token.RefreshTokenMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;



@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final PhoneVerificationService phoneVerificationService;
    private final PasswordResetTokenStore passwordResetTokenStore;
    private final EmailSender emailSender;
    private final EmailVerificationStore emailVerificationStore;

    public void sendEmailVerificationCode(EmailVerificationSendRequest request) {
        String email = normalizeEmail(request.email());
        if (userMapper.findByEmail(email) == null) {
            throw new PhoneVerificationTargetMismatchException();
        }

        if (emailVerificationStore.isCooldown(email)) {
            throw new IllegalStateException("인증번호는 60초 후 다시 요청할 수 있습니다.");
        }

        String code = generateVerificationCode();
        emailVerificationStore.save(email, code);

        try {
            emailSender.sendVerificationCode(email, code);
        } catch (Exception e) {
            emailVerificationStore.delete(email);
            throw new IllegalStateException("이메일 인증번호 발송에 실패했습니다.", e);
        }
    }

    public PasswordResetVerificationResponse verifyEmailVerificationCode(EmailVerificationVerifyRequest request) {
        String email = normalizeEmail(request.email());
        User user = userMapper.findByEmail(email);
        if (user == null) {
            throw new PhoneVerificationTargetMismatchException();
        }

        String savedCode = emailVerificationStore.getCode(email);
        if (savedCode == null) {
            throw new IllegalStateException("인증번호가 만료되었거나 존재하지 않습니다.");
        }
        if (!savedCode.equals(request.code())) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }

        emailVerificationStore.delete(email);
        String resetToken = passwordResetTokenStore.issue(user.getUserId());
        return new PasswordResetVerificationResponse(resetToken, PasswordResetTokenStore.TOKEN_TTL_SECONDS);
    }

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

    private String generateVerificationCode() {
        int number = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", number);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
