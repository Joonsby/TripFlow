package com.tripflow.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        LoginUserResponse user
) {
}