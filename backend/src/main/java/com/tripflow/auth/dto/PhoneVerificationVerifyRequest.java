package com.tripflow.auth.dto;

import com.tripflow.auth.verification.PhoneVerificationPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PhoneVerificationVerifyRequest(

        @NotBlank
        @Pattern(regexp = "^01[016789]\\d{7,8}$")
        String phoneNumber,

        @NotBlank
        @Pattern(
                regexp = "^\\d{6}$",
                message = "인증번호는 6자리 숫자입니다."
        )
        String code,

        @NotNull
        PhoneVerificationPurpose purpose

) {
}