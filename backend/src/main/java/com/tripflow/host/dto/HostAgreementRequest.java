package com.tripflow.host.dto;

import jakarta.validation.constraints.AssertTrue;

public record HostAgreementRequest(
        @AssertTrue(message = "호스트 운영 정책에 동의해야 합니다.")
        boolean hostPolicy,

        @AssertTrue(message = "개인정보 수집 및 이용에 동의해야 합니다.")
        boolean privacy,

        @AssertTrue(message = "입력 정보의 정확성에 동의해야 합니다.")
        boolean informationAccuracy
) {
}
