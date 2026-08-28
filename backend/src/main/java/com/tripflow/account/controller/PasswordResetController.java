package com.tripflow.account.controller;

import com.tripflow.account.dto.passwordreset.*;
import com.tripflow.account.service.PasswordResetService;
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
@RequestMapping("/api/auth/password-reset")
@RequiredArgsConstructor
@Tag(name = "비밀번호 초기화", description = "휴대폰 인증과 일회용 토큰을 통한 비밀번호 초기화 API")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/email-verifications")
    @Operation(summary = "이메일 인증번호 발송", description = "가입된 이메일로 비밀번호 초기화 인증번호를 발송합니다.")
    public ResponseEntity<Void> sendEmailVerificationCode(
            @Valid @RequestBody EmailVerificationSendRequest request
    ) {
        passwordResetService.sendEmailVerificationCode(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/email-verifications/verify")
    @Operation(
            summary = "이메일 인증번호 확인",
            description = "이메일 인증번호를 확인하고 5분간 유효한 비밀번호 초기화 토큰을 발급합니다."
    )
    public ResponseEntity<PasswordResetVerificationResponse> verifyEmailVerificationCode(
            @Valid @RequestBody EmailVerificationVerifyRequest request
    ) {
        return ResponseEntity.ok(passwordResetService.verifyEmailVerificationCode(request));
    }

    @PostMapping("/phone-verifications")
    @Operation(summary = "비밀번호 초기화 인증번호 발송", description = "이메일과 휴대폰 번호가 일치하는 회원에게 인증번호를 발송합니다.")
    public ResponseEntity<Void> sendVerificationCode(
            @Valid @RequestBody PasswordResetPhoneVerificationSendRequest request
    ) {
        passwordResetService.sendVerificationCode(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/phone-verifications/verify")
    @Operation(
            summary = "비밀번호 초기화 인증번호 확인",
            description = "비밀번호 초기화 용도로 발급된 인증번호를 확인하고 5분간 유효한 일회용 토큰을 발급합니다."
    )
    public ResponseEntity<PasswordResetVerificationResponse> verifyCode(
            @Valid @RequestBody PasswordResetPhoneVerificationVerifyRequest request
    ) {
        return ResponseEntity.ok(passwordResetService.verifyCode(request));
    }

    @PostMapping
    @Operation(summary = "비밀번호 초기화", description = "휴대폰 인증 후 발급된 일회용 토큰으로 새로운 비밀번호를 저장합니다.")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }
}
