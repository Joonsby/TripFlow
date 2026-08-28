package com.tripflow.auth.controller;

import com.tripflow.auth.dto.LoginRequest;
import com.tripflow.auth.dto.LoginResponse;
import com.tripflow.auth.dto.LoginResult;
import com.tripflow.auth.dto.RefreshResponse;
import com.tripflow.auth.service.AuthService;
import com.tripflow.auth.token.RefreshTokenCookieProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "로그인", description = "로그인, 액세스 토큰 재발급 및 로그아웃 API")
public class LoginController {

    private final AuthService authService;
    private final RefreshTokenCookieProvider cookieProvider;

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
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(name = RefreshTokenCookieProvider.COOKIE_NAME, required = false) String refreshToken
    ) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "저장된 리프레시 토큰을 삭제하고 리프레시 토큰 쿠키를 만료시킵니다.")
    public ResponseEntity<Void> logout(
            @CookieValue(name = RefreshTokenCookieProvider.COOKIE_NAME, required = false) String refreshToken
    ) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookieProvider.delete().toString())
                .build();
    }
}
