package com.tripflow.account.dto.signup;

public record SignupResponse(
        Integer userId,
        String email,
        String name,
        String phoneNumber
) {
}
