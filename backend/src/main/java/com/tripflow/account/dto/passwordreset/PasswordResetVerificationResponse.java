package com.tripflow.account.dto.passwordreset;

public record PasswordResetVerificationResponse(
        String resetToken,
        long expiresIn
) {
}
