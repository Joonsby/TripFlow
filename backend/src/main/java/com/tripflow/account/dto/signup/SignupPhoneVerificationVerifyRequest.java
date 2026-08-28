package com.tripflow.account.dto.signup;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SignupPhoneVerificationVerifyRequest(
        @NotBlank
        @Pattern(regexp = "^01[016789]\\d{7,8}$", message = "전화번호는 하이픈 없이 입력해주세요.")
        String phoneNumber,

        @NotBlank
        @Pattern(regexp = "^\\d{6}$", message = "인증번호는 6자리 숫자입니다.")
        String code
) {
}
