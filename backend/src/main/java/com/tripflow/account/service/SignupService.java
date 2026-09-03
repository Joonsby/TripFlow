package com.tripflow.account.service;

import com.tripflow.account.dto.signup.SignupPhoneVerificationSendRequest;
import com.tripflow.account.dto.signup.SignupPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.signup.SignupRequest;
import com.tripflow.account.dto.signup.SignupResponse;
import com.tripflow.account.exception.DuplicateEmailException;
import com.tripflow.account.exception.DuplicatePhoneNumberException;
import com.tripflow.account.verification.PhoneVerificationPurpose;
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
public class SignupService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final PhoneVerificationService phoneVerificationService;

    public boolean isEmailAvailable(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return !userMapper.existsByEmail(normalizedEmail);
    }

    public void sendVerificationCode(SignupPhoneVerificationSendRequest request) {
        String phoneNumber = request.phoneNumber().trim();
        if (userMapper.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicatePhoneNumberException();
        }
        phoneVerificationService.send(phoneNumber, PhoneVerificationPurpose.SIGNUP);
    }

    public void verifyCode(SignupPhoneVerificationVerifyRequest request) {
        phoneVerificationService.verify(
                request.phoneNumber().trim(),
                request.code(),
                PhoneVerificationPurpose.SIGNUP
        );
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = normalizeEmail(request.email());
        String name = request.name().trim();
        String nickname = normalizeOptionalNickname(request.nickname());
        String phoneNumber = request.phoneNumber().trim();

        if (userMapper.existsByEmail(email)) {
            throw new DuplicateEmailException();
        }
        if (userMapper.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicatePhoneNumberException();
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = new User(passwordHash, name, nickname, phoneNumber, email);

        if (userMapper.insertUser(user) != 1) {
            throw new IllegalStateException("회원가입 처리 중 오류가 발생했습니다.");
        }

        return new SignupResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getPhoneNumber()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            return null;
        }
        return nickname.trim();
    }
}
