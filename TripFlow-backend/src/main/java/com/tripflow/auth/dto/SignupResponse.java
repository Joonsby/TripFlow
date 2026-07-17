package com.tripflow.auth.dto;

public record SignupResponse(
        Integer userId,
        String email,
        String name,
        String phoneNumber
) {
}