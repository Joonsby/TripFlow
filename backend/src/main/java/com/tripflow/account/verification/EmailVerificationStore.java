package com.tripflow.account.verification;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class EmailVerificationStore {

    private static final long CODE_TTL_SECONDS = 180;
    private static final long RESEND_COOLDOWN_SECONDS = 60;

    private final Map<String, VerificationValue> values = new ConcurrentHashMap<>();

    public void save(String email, String code) {
        values.put(
                email,
                new VerificationValue(
                        code,
                        Instant.now().plusSeconds(CODE_TTL_SECONDS),
                        Instant.now().plusSeconds(RESEND_COOLDOWN_SECONDS)
                )
        );
    }

    public String getCode(String email) {
        VerificationValue value = values.get(email);

        if (value == null) {
            return null;
        }

        if (value.expiresAt().isBefore(Instant.now())) {
            delete(email);
            return null;
        }

        return value.code();
    }

    public boolean isCooldown(String email) {
        VerificationValue value = values.get(email);
        return value != null && value.resendAvailableAt().isAfter(Instant.now());
    }

    public void delete(String email) {
        values.remove(email);
    }

    private record VerificationValue(
            String code,
            Instant expiresAt,
            Instant resendAvailableAt
    ) {
    }
}
