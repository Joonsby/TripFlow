package com.tripflow.account.dto.passwordreset;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest(
        @NotBlank String resetToken,

        @NotBlank
        @Size(min = 8, max = 64, message = "비밀번호는 8자 이상 64자 이하로 입력해주세요.")
        String newPassword,

        @NotBlank String newPasswordConfirm
) {
}
