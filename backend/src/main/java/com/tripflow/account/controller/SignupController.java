package com.tripflow.account.controller;

import com.tripflow.account.dto.signup.EmailAvailabilityResponse;
import com.tripflow.account.dto.signup.SignupPhoneVerificationSendRequest;
import com.tripflow.account.dto.signup.SignupPhoneVerificationVerifyRequest;
import com.tripflow.account.dto.signup.SignupRequest;
import com.tripflow.account.dto.signup.SignupResponse;
import com.tripflow.account.service.SignupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
@Tag(name = "회원가입", description = "이메일 확인, 회원가입 휴대폰 인증 및 회원 등록 API")
public class SignupController {

    private final SignupService signupService;

    @GetMapping("/email-availability")
    @Operation(summary = "이메일 사용 가능 여부 확인", description = "입력한 이메일을 정규화한 뒤 이미 가입된 이메일인지 확인합니다.")
    public EmailAvailabilityResponse checkEmailAvailability(@RequestParam @NotBlank @Email String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return new EmailAvailabilityResponse(normalizedEmail, signupService.isEmailAvailable(normalizedEmail));
    }

    @PostMapping("/signup/phone-verifications")
    @Operation(summary = "회원가입 인증번호 발송", description = "가입되지 않은 휴대폰 번호로 회원가입 인증번호를 발송합니다.")
    public ResponseEntity<Void> sendVerificationCode(
            @Valid @RequestBody SignupPhoneVerificationSendRequest request
    ) {
        signupService.sendVerificationCode(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signup/phone-verifications/verify")
    @Operation(summary = "회원가입 인증번호 확인", description = "회원가입 용도로 발급된 휴대폰 인증번호를 확인합니다.")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody SignupPhoneVerificationVerifyRequest request) {
        signupService.verifyCode(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "이메일, 이름, 비밀번호와 휴대폰 번호로 신규 회원을 등록합니다.")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(signupService.signup(request));
    }
}
