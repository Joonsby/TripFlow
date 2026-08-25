package com.tripflow.host.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Host {

    private Integer hostId;
    private Integer userId;

    private String businessName;
    private String representativeName;
    private String businessNumber;
    private LocalDate openingDate;

    private String businessPostCode;
    private String businessRoadAddress;
    private String businessDetailAddress;

    private BigDecimal latitude;
    private BigDecimal longitude;

    private String introduction;
    private HostStatus status;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    private LocalDateTime businessVerifiedAt;
    private LocalDateTime hostPolicyAgreedAt;
    private LocalDateTime privacyAgreedAt;
    private LocalDateTime informationAccuracyAgreedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
