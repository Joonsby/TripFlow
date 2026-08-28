package com.tripflow.account.verification;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PasswordResetTokenStore {

    public static final long TOKEN_TTL_SECONDS = 300;
    private static final int TOKEN_BYTE_LENGTH = 32;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, TokenValue> values = new ConcurrentHashMap<>();

    public String issue(Integer userId) {
        byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);

        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        values.put(hash(token), new TokenValue(userId, Instant.now().plusSeconds(TOKEN_TTL_SECONDS)));
        return token;
    }

    public Integer consume(String token) {
        TokenValue value = values.remove(hash(token));
        if (value == null || value.expiresAt().isBefore(Instant.now())) {
            return null;
        }
        return value.userId();
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", e);
        }
    }

    private record TokenValue(Integer userId, Instant expiresAt) {
    }
}
