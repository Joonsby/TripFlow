package com.tripflow.auth.service;

import com.tripflow.auth.config.AuthProperties;
import com.tripflow.auth.dto.LoginRequest;
import com.tripflow.auth.dto.LoginResponse;
import com.tripflow.auth.dto.LoginResult;
import com.tripflow.auth.dto.LoginUserResponse;
import com.tripflow.auth.dto.RefreshResponse;
import com.tripflow.auth.exception.InvalidLoginException;
import com.tripflow.auth.exception.InvalidRefreshTokenException;
import com.tripflow.auth.token.AccessTokenProvider;
import com.tripflow.auth.token.RefreshToken;
import com.tripflow.auth.token.RefreshTokenMapper;
import com.tripflow.auth.token.RefreshTokenProvider;
import com.tripflow.host.mapper.HostMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final HostMapper hostMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final AccessTokenProvider accessTokenProvider;
    private final RefreshTokenProvider refreshTokenProvider;
    private final AuthProperties authProperties;

    @Transactional
    public LoginResult login(LoginRequest request) {
        User user = userMapper.findByEmail(normalizeEmail(request.email()));
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidLoginException();
        }

        String accessToken = accessTokenProvider.createAccessToken(user.getUserId(), user.getEmail());
        String refreshToken = refreshTokenProvider.createRefreshToken();
        String refreshTokenHash = refreshTokenProvider.hash(refreshToken);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .userId(user.getUserId())
                .tokenHash(refreshTokenHash)
                .expiresAt(LocalDateTime.now().plusDays(authProperties.refreshTokenDays()))
                .build();
        refreshTokenMapper.insert(refreshTokenEntity);

        LoginUserResponse userResponse = createLoginUserResponse(user);
        LoginResponse response = new LoginResponse(
                accessToken,
                "Bearer",
                accessTokenProvider.getExpiresInSeconds(),
                userResponse
        );
        long refreshMaxAgeSeconds = authProperties.refreshTokenDays() * 24 * 60 * 60;
        return new LoginResult(response, refreshToken, refreshMaxAgeSeconds);
    }

    @Transactional
    public RefreshResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }

        String tokenHash = refreshTokenProvider.hash(refreshToken);
        RefreshToken savedToken = refreshTokenMapper.findByTokenHash(tokenHash);
        if (savedToken == null) {
            throw new InvalidRefreshTokenException();
        }
        if (savedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenMapper.deleteByTokenHash(tokenHash);
            throw new InvalidRefreshTokenException();
        }

        User user = userMapper.findById(savedToken.getUserId());
        if (user == null) {
            refreshTokenMapper.deleteByTokenHash(tokenHash);
            throw new InvalidRefreshTokenException();
        }

        String newAccessToken = accessTokenProvider.createAccessToken(user.getUserId(), user.getEmail());
        return new RefreshResponse(
                newAccessToken,
                "Bearer",
                accessTokenProvider.getExpiresInSeconds(),
                createLoginUserResponse(user)
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        refreshTokenMapper.deleteByTokenHash(refreshTokenProvider.hash(refreshToken));
    }

    private LoginUserResponse createLoginUserResponse(User user) {
        return new LoginUserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                hostMapper.existsApprovedByUserId(user.getUserId())
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
