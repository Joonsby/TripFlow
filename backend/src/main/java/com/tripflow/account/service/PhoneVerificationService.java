package com.tripflow.account.service;

import com.tripflow.account.verification.PhoneVerificationPurpose;
import com.tripflow.account.verification.PhoneVerificationStore;
import com.tripflow.account.verification.SmsSender;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class PhoneVerificationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SmsSender smsSender;
    private final PhoneVerificationStore phoneVerificationStore;

    public void send(String phoneNumber, PhoneVerificationPurpose purpose) {
        if (phoneVerificationStore.isCooldown(phoneNumber, purpose)) {
            throw new IllegalStateException("인증번호는 60초 후 다시 요청할 수 있습니다.");
        }

        String code = generateVerificationCode();
        phoneVerificationStore.save(phoneNumber, purpose, code);

        try {
            smsSender.send(phoneNumber, "[TripFlow] 인증번호는 " + code + "입니다. 3분 이내에 입력해주세요.");
        } catch (Exception e) {
            phoneVerificationStore.delete(phoneNumber, purpose);
            throw new IllegalStateException("인증번호 발송에 실패했습니다.", e);
        }
    }

    public void verify(String phoneNumber, String code, PhoneVerificationPurpose purpose) {
        String savedCode = phoneVerificationStore.getCode(phoneNumber, purpose);

        if (savedCode == null) {
            throw new IllegalStateException("인증번호가 만료되었거나 존재하지 않습니다.");
        }

        if (!savedCode.equals(code)) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }

        phoneVerificationStore.delete(phoneNumber, purpose);
    }

    private String generateVerificationCode() {
        int number = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", number);
    }
}
