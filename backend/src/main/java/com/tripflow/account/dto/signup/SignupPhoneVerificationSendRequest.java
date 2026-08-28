package com.tripflow.account.dto.signup;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SignupPhoneVerificationSendRequest(
        @NotBlank
        @Pattern(regexp = "^01[016789]\\d{7,8}$", message = "전화번호는 하이픈 없이 입력해주세요.")
        String phoneNumber
) {
}
