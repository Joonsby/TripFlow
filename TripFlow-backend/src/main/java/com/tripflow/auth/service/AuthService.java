package com.tripflow.auth.service;

import com.tripflow.auth.dto.SignupRequest;
import com.tripflow.auth.dto.SignupResponse;
import com.tripflow.auth.exception.DuplicateEmailException;
import com.tripflow.auth.exception.DuplicatePhoneNumberException;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserMapper userMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean isEmailAvailable(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return !userMapper.existsByEmail(normalizedEmail);
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = normalizeEmail(request.email());
        String name = request.name().trim();
        String phoneNumber = request.phoneNumber().trim();

        if (userMapper.existsByEmail(email)) {
            throw new DuplicateEmailException();
        }

        if (userMapper.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicatePhoneNumberException();
        }

        String passwordHash =
                passwordEncoder.encode(request.password());

        User user = new User(
                passwordHash,
                name,
                phoneNumber,
                email
        );

        int insertedRows = userMapper.insertUser(user);

        if (insertedRows != 1) {
            throw new IllegalStateException(
                    "회원가입 처리 중 오류가 발생했습니다."
            );
        }

        return new SignupResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getPhoneNumber()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}