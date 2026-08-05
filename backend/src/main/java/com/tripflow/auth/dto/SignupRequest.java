package com.tripflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 50, message = "이메일은 50자 이하로 입력해주세요.")
        String email,

        @NotBlank(message = "이름 또는 닉네임을 입력해주세요.")
        @Size(min = 2, max = 30,
                message = "이름 또는 닉네임은 2자 이상 30자 이하로 입력해주세요.")
        String name,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Size(min = 8, max = 64,
                message = "비밀번호는 8자 이상 64자 이하로 입력해주세요.")
        String password,

        @NotBlank(message = "전화번호를 입력해주세요.")
        @Pattern(
                regexp = "^01[016789]\\d{7,8}$",
                message = "전화번호는 하이픈 없이 입력해주세요."
        )
        String phoneNumber
) {
}