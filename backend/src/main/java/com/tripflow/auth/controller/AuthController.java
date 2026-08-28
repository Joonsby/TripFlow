package com.tripflow.auth.controller;

import com.tripflow.auth.cookie.RefreshTokenCookieProvider;
import com.tripflow.auth.dto.*;
import com.tripflow.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
@Tag(name = "인증", description = "이메일 확인, 휴대폰 인증, 회원가입, 로그인 및 토큰 관리 API")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieProvider cookieProvider;

    @GetMapping("/email-availability")
    @Operation(summary = "이메일 사용 가능 여부 확인", description = "입력한 이메일을 정규화한 뒤 이미 가입된 이메일인지 확인합니다.")
    public EmailAvailabilityResponse checkEmailAvailability(@RequestParam @NotBlank @Email String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        boolean available = authService.isEmailAvailable(normalizedEmail);

        return new EmailAvailabilityResponse(normalizedEmail, available);
    }

    @PostMapping("/phone-verifications")
    @Operation(summary = "휴대폰 인증번호 발송", description = "요청 목적에 맞는 6자리 인증번호를 생성하여 입력한 휴대폰 번호로 발송합니다.")
    public ResponseEntity<Void> sendPhoneVerificationCode(@Valid @RequestBody PhoneVerificationSendRequest request) {
        authService.sendPhoneVerificationCode(request);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/phone-verifications/verify")
    @Operation(summary = "휴대폰 인증번호 확인", description = "휴대폰 번호와 인증 목적에 대해 발급된 인증번호가 유효한지 확인합니다.")
    public ResponseEntity<Void> verifyPhoneVerificationCode(
        @Valid @RequestBody PhoneVerificationVerifyRequest request
    ) {
        authService.verifyPhoneVerificationCode(request);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "이메일, 이름, 비밀번호와 휴대폰 번호로 신규 회원을 등록합니다.")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        SignupResponse response = authService.signup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호를 확인하여 액세스 토큰을 반환하고 리프레시 토큰 쿠키를 발급합니다.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request);
        String cookie = cookieProvider.create(result.refreshToken(), result.refreshTokenMaxAgeSeconds()).toString();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie)
                .body(result.response());
    }

    @PostMapping("/refresh")
    @Operation(summary = "액세스 토큰 재발급", description = "리프레시 토큰 쿠키를 검증하고 새로운 액세스 토큰을 발급합니다.")
    public ResponseEntity<RefreshResponse> refreshAccessToken(
            @CookieValue(name = RefreshTokenCookieProvider.COOKIE_NAME, required = false)
            String refreshToken
    ) {
        RefreshResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "저장된 리프레시 토큰을 삭제하고 리프레시 토큰 쿠키를 만료시킵니다.")
    public ResponseEntity<Void> logout(
            @CookieValue(name = RefreshTokenCookieProvider.COOKIE_NAME, required = false)
            String refreshToken
    ) {
        authService.logout(refreshToken);
        String deletedCookie = cookieProvider.delete().toString();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deletedCookie)
                .build();
    }
}
