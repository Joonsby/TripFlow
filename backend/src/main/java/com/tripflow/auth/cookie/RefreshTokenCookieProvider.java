package com.tripflow.auth.cookie;

import java.time.Duration;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.tripflow.auth.config.AuthProperties;

@Component
@RequiredArgsConstructor
public class RefreshTokenCookieProvider {

    public static final String COOKIE_NAME = "refreshToken";

    private final AuthProperties authProperties;

    public ResponseCookie create(
            String refreshToken,
            long maxAgeSeconds
    ) {
        return ResponseCookie.from(
                        COOKIE_NAME,
                        refreshToken
                )
                .httpOnly(true)
                .secure(authProperties.cookieSecure())
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }

    public ResponseCookie delete() {
        return ResponseCookie.from(
                        COOKIE_NAME,
                        ""
                )
                .httpOnly(true)
                .secure(authProperties.cookieSecure())
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .build();
    }
}