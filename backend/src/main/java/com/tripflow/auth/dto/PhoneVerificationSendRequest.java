package com.tripflow.auth.dto;

import com.tripflow.auth.verification.PhoneVerificationPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PhoneVerificationSendRequest(

        @NotBlank
        @Pattern(
                regexp = "^01[016789]\\d{7,8}$",
                message = "전화번호는 하이픈 없이 입력해주세요."
        )
        String phoneNumber,

        @NotNull
        PhoneVerificationPurpose purpose

) {
}