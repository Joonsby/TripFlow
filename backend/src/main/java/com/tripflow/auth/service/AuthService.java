package com.tripflow.auth.service;

import com.tripflow.auth.config.AuthProperties;
import com.tripflow.auth.dto.*;
import com.tripflow.auth.exception.DuplicateEmailException;
import com.tripflow.auth.exception.DuplicatePhoneNumberException;
import com.tripflow.auth.exception.InvalidLoginException;
import com.tripflow.auth.exception.InvalidRefreshTokenException;
import com.tripflow.auth.refresh.RefreshToken;
import com.tripflow.auth.refresh.RefreshTokenMapper;
import com.tripflow.auth.sms.SmsSender;
import com.tripflow.auth.token.AccessTokenProvider;
import com.tripflow.auth.token.RefreshTokenProvider;
import com.tripflow.auth.verification.PhoneVerificationStore;
import com.tripflow.host.mapper.HostMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final HostMapper hostMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final SmsSender smsSender;
    private final PhoneVerificationStore phoneVerificationStore;

    private final PasswordEncoder passwordEncoder;
    private final AccessTokenProvider accessTokenProvider;
    private final RefreshTokenProvider refreshTokenProvider;
    private final AuthProperties authProperties;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public boolean isEmailAvailable(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return !userMapper.existsByEmail(normalizedEmail);
    }

    public void sendPhoneVerificationCode(PhoneVerificationSendRequest request) {
        String phoneNumber = request.phoneNumber().trim();
        if (phoneVerificationStore.isCooldown(phoneNumber, request.purpose())) {
            throw new IllegalStateException("인증번호는 60초 후 다시 요청할 수 있습니다.");
        }

        String code = generateVerificationCode();

        phoneVerificationStore.save(phoneNumber, request.purpose(), code);

        try {
            smsSender.send(
                    phoneNumber,
                    "[TripFlow] 인증번호는 "
                            + code
                            + "입니다. 3분 이내에 입력해주세요."
            );
        } catch (Exception e) {
            phoneVerificationStore.delete(phoneNumber, request.purpose());

            throw new IllegalStateException(
                    "인증번호 발송에 실패했습니다.",
                    e
            );
        }
    }

    public void verifyPhoneVerificationCode(PhoneVerificationVerifyRequest request) {
        String phoneNumber = request.phoneNumber().trim();

        String savedCode = phoneVerificationStore.getCode(phoneNumber, request.purpose());

        if (savedCode == null) {
            throw new IllegalStateException("인증번호가 만료되었거나 존재하지 않습니다.");
        }

        if (!savedCode.equals(request.code())) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }

        phoneVerificationStore.delete(phoneNumber, request.purpose());
    }

    private String generateVerificationCode() {

        int number = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", number);
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

        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(passwordHash, name, phoneNumber, email);

        int insertedRows = userMapper.insertUser(user);

        if (insertedRows != 1) {
            throw new IllegalStateException("회원가입 처리 중 오류가 발생했습니다.");
        }

        return new SignupResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getPhoneNumber()
        );
    }


    @Transactional
    public LoginResult login(LoginRequest request) {

        String email = normalizeEmail(request.email());

        User user = userMapper.findByEmail(email);

        if (user == null) {
            throw new InvalidLoginException();
        }

        boolean passwordMatches = passwordEncoder.matches(request.password(), user.getPasswordHash());

        if (!passwordMatches) {
            throw new InvalidLoginException();
        }

        String accessToken = accessTokenProvider.createAccessToken(user.getUserId(), user.getEmail());

        String refreshToken = refreshTokenProvider.createRefreshToken();

        String refreshTokenHash = refreshTokenProvider.hash(refreshToken);

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(authProperties.refreshTokenDays());

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .userId(user.getUserId())
                .tokenHash(refreshTokenHash)
                .expiresAt(expiresAt)
                .build();

        refreshTokenMapper.insert(refreshTokenEntity);

        LoginUserResponse userResponse = new LoginUserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                hostMapper.existsApprovedByUserId(user.getUserId())
        );

        LoginResponse response = new LoginResponse(
                accessToken,
                "Bearer",
                accessTokenProvider.getExpiresInSeconds(),
                userResponse
        );

        long refreshMaxAgeSeconds = authProperties.refreshTokenDays() * 24 * 60 * 60;

        return new LoginResult(
                response,
                refreshToken,
                refreshMaxAgeSeconds
        );
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

        LoginUserResponse userResponse = new LoginUserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                hostMapper.existsApprovedByUserId(user.getUserId())
        );

        return new RefreshResponse(
                newAccessToken,
                "Bearer",
                accessTokenProvider.getExpiresInSeconds(),
                userResponse
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        String tokenHash = refreshTokenProvider.hash(refreshToken);
        refreshTokenMapper.deleteByTokenHash(tokenHash);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
