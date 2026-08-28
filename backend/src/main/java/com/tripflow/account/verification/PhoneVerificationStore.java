package com.tripflow.account.verification;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PhoneVerificationStore {

    private static final long CODE_TTL_SECONDS = 180;
    private static final long RESEND_COOLDOWN_SECONDS = 60;

    private final Map<String, VerificationValue> values = new ConcurrentHashMap<>();

    public void save(String phoneNumber, PhoneVerificationPurpose purpose, String code) {
        values.put(
                createKey(phoneNumber, purpose),
                new VerificationValue(
                        code,
                        Instant.now().plusSeconds(CODE_TTL_SECONDS),
                        Instant.now().plusSeconds(RESEND_COOLDOWN_SECONDS)
                )
        );
    }

    public String getCode(String phoneNumber, PhoneVerificationPurpose purpose) {
        VerificationValue value = values.get(createKey(phoneNumber, purpose));

        if (value == null) {
            return null;
        }

        if (value.expiresAt().isBefore(Instant.now())) {
            delete(phoneNumber, purpose);
            return null;
        }

        return value.code();
    }

    public boolean isCooldown(String phoneNumber, PhoneVerificationPurpose purpose) {
        VerificationValue value = values.get(createKey(phoneNumber, purpose));
        return value != null && value.resendAvailableAt().isAfter(Instant.now());
    }

    public void delete(String phoneNumber, PhoneVerificationPurpose purpose) {
        values.remove(createKey(phoneNumber, purpose));
    }

    private String createKey(String phoneNumber, PhoneVerificationPurpose purpose) {
        return purpose.name() + ":" + phoneNumber;
    }

    private record VerificationValue(
            String code,
            Instant expiresAt,
            Instant resendAvailableAt
    ) {
    }
}
