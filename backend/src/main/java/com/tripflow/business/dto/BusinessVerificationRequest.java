package com.tripflow.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record BusinessVerificationRequest(
        @NotBlank(message = "상호명은 필수입니다.")
        String businessName,

        @NotBlank(message = "대표자명은 필수입니다.")
        String representativeName,

        @NotBlank(message = "사업자등록번호는 필수입니다.")
        @Pattern(
        regexp = "^\\d{10}$",
        message = "사업자등록번호는 숫자 10자리여야 합니다."
        )
        String businessNumber,

        @NotNull(message = "개업일자는 필수입니다.")
        LocalDate openingDate
) {
}
