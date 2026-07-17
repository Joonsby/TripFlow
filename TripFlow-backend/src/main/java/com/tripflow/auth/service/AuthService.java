package com.tripflow.auth.service;

import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;

    public boolean isEmailAvailable(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return !userMapper.existsByEmail(normalizedEmail);
    }
}