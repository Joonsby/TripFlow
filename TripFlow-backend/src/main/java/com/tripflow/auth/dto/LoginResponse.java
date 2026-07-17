package com.tripflow.auth.dto;

public record LoginResponse(
        Integer userId,
        String email,
        String name,
        String phoneNumber
) {
}