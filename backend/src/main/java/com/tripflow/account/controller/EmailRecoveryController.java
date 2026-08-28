package com.tripflow.account.controller;

import com.tripflow.account.dto.emailrecovery.EmailRecoveryPhoneVerificationSendRequest;
import com.tripflow.account.dto.emailrecovery.EmailRecoveryPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.emailrecovery.EmailRecoveryResponse;
import com.tripflow.account.service.EmailRecoveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/email-recovery")
@RequiredArgsConstructor
@Tag(name = "이메일 찾기", description = "휴대폰 인증을 통한 회원 이메일 찾기 API")
public class EmailRecoveryController {

    private final EmailRecoveryService emailRecoveryService;

    @PostMapping("/phone-verifications")
    @Operation(summary = "이메일 찾기 인증번호 발송", description = "이름과 휴대폰 번호가 일치하는 회원에게 인증번호를 발송합니다.")
    public ResponseEntity<Void> sendVerificationCode(
            @Valid @RequestBody EmailRecoveryPhoneVerificationSendRequest request
    ) {
        emailRecoveryService.sendVerificationCode(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/phone-verifications/verify")
    @Operation(summary = "이메일 찾기 인증번호 확인", description = "인증번호를 확인하고 해당 회원의 이메일을 반환합니다.")
    public ResponseEntity<EmailRecoveryResponse> verifyCode(
            @Valid @RequestBody EmailRecoveryPhoneVerificationVerifyRequest request
    ) {
        return ResponseEntity.ok(emailRecoveryService.verifyCode(request));
    }
}
