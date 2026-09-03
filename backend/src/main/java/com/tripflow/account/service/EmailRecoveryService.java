package com.tripflow.account.service;

import com.tripflow.account.dto.emailrecovery.EmailRecoveryPhoneVerificationSendRequest;
import com.tripflow.account.dto.emailrecovery.EmailRecoveryPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.emailrecovery.EmailRecoveryResponse;
import com.tripflow.account.exception.PhoneVerificationTargetMismatchException;
import com.tripflow.account.verification.PhoneVerificationPurpose;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EmailRecoveryService {

    private final UserMapper userMapper;
    private final PhoneVerificationService phoneVerificationService;

    public void sendVerificationCode(EmailRecoveryPhoneVerificationSendRequest request) {
        User user = findUser(request.name(), request.phoneNumber());
        phoneVerificationService.send(user.getPhoneNumber(), PhoneVerificationPurpose.FIND_EMAIL);
    }

    public EmailRecoveryResponse verifyCode(EmailRecoveryPhoneVerificationVerifyRequest request) {
        User user = findUser(request.name(), request.phoneNumber());
        phoneVerificationService.verify(
                user.getPhoneNumber(),
                request.code(),
                PhoneVerificationPurpose.FIND_EMAIL
        );
        return new EmailRecoveryResponse(maskEmail(user.getEmail()));
    }

    private User findUser(String name, String phoneNumber) {
        User user = userMapper.findByNameAndPhoneNumber(name.trim(), phoneNumber.trim());
        if (user == null) {
            throw new PhoneVerificationTargetMismatchException();
        }
        return user;
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 0 || atIndex == email.length() - 1) {
            return "***";
        }

        String localPart = email.substring(0, atIndex);
        String visiblePart = localPart.substring(0, Math.min(localPart.length(), 2));
        return visiblePart + "***" + email.substring(atIndex);
    }
}
