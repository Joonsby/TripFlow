package com.tripflow.account.dto.passwordreset;

import com.tripflow.global.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(
        @NotBlank String resetToken,

        @NotBlank
        @ValidPassword
        String newPassword,

        @NotBlank String newPasswordConfirm
) {
}
