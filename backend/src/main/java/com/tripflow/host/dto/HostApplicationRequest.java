package com.tripflow.host.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HostApplicationRequest(
        @NotBlank(message = "상호명은 필수입니다.")
        @Size(max = 100, message = "상호명은 100자 이하여야 합니다.")
        String businessName,

        @NotBlank(message = "대표자명은 필수입니다.")
        @Size(max = 50, message = "대표자명은 50자 이하여야 합니다.")
        String representativeName,

        @NotBlank(message = "사업자등록번호는 필수입니다.")
        @Pattern(
                regexp = "^\\d{3}-?\\d{2}-?\\d{5}$",
                message = "사업자등록번호는 숫자 10자리여야 합니다."
        )
        String businessNumber,

        @NotNull(message = "개업일자는 필수입니다.")
        @PastOrPresent(message = "개업일자는 미래일 수 없습니다.")
        LocalDate openingDate,

        @NotBlank(message = "우편번호는 필수입니다.")
        @Pattern(regexp = "^\\d{5}$", message = "우편번호는 숫자 5자리여야 합니다.")
        String businessPostCode,

        @NotBlank(message = "도로명 주소는 필수입니다.")
        @Size(max = 200, message = "도로명 주소는 200자 이하여야 합니다.")
        String businessRoadAddress,

        @Size(max = 200, message = "상세 주소는 200자 이하여야 합니다.")
        String businessDetailAddress,

        @DecimalMin(value = "-90.0", message = "위도는 -90 이상이어야 합니다.")
        @DecimalMax(value = "90.0", message = "위도는 90 이하여야 합니다.")
        BigDecimal latitude,

        @DecimalMin(value = "-180.0", message = "경도는 -180 이상이어야 합니다.")
        @DecimalMax(value = "180.0", message = "경도는 180 이하여야 합니다.")
        BigDecimal longitude,

        @Size(max = 500, message = "호스트 소개는 500자 이하여야 합니다.")
        String introduction,

        @Valid
        @NotNull(message = "필수 약관 동의 정보가 필요합니다.")
        HostAgreementRequest agreements
) {
}
