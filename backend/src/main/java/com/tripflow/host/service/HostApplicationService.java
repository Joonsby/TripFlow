package com.tripflow.host.service;

import com.tripflow.business.dto.BusinessVerificationRequest;
import com.tripflow.business.dto.BusinessVerificationResponse;
import com.tripflow.business.service.BusinessVerificationService;
import com.tripflow.host.domain.Host;
import com.tripflow.host.domain.HostStatus;
import com.tripflow.host.dto.HostApplicationRequest;
import com.tripflow.host.dto.HostApplicationResponse;
import com.tripflow.host.exception.BusinessVerificationFailedException;
import com.tripflow.host.exception.DuplicateBusinessNumberException;
import com.tripflow.host.exception.DuplicateHostApplicationException;
import com.tripflow.host.mapper.HostMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HostApplicationService {
    private final HostMapper hostMapper;
    private final UserMapper userMapper;
    private final BusinessVerificationService businessVerificationService;

    @Transactional
    public HostApplicationResponse apply(Integer userId, HostApplicationRequest request) {
        User user = userMapper.findById(userId);

        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        if (hostMapper.existsByUserId(userId)) {
            throw new DuplicateHostApplicationException();
        }

        String businessNumber = normalizeBusinessNumber(request.businessNumber());

        if (hostMapper.existsByBusinessNumber(businessNumber)) {
            throw new DuplicateBusinessNumberException();
        }

        validateRequiredAgreements(request);

        BusinessVerificationResponse verification = businessVerificationService.verify(
                new BusinessVerificationRequest(
                        request.businessName().trim(),
                        request.representativeName().trim(),
                        businessNumber,
                        request.openingDate()
                )
        );

        if (!verification.verified()) {
            throw new BusinessVerificationFailedException(verification.message());
        }

        LocalDateTime now = LocalDateTime.now();

        Host host = new Host();
        host.setUserId(userId);
        host.setBusinessName(request.businessName().trim());
        host.setRepresentativeName(request.representativeName().trim());
        host.setBusinessNumber(businessNumber);
        host.setOpeningDate(request.openingDate());
        host.setBusinessPostCode(request.businessPostCode().trim());
        host.setBusinessRoadAddress(request.businessRoadAddress().trim());
        host.setBusinessDetailAddress(trimToNull(request.businessDetailAddress()));
        host.setLatitude(request.latitude());
        host.setLongitude(request.longitude());
        host.setIntroduction(trimToNull(request.introduction()));
        host.setStatus(HostStatus.APPROVED);
        host.setApprovedAt(now);
        host.setBusinessVerifiedAt(now);
        host.setHostPolicyAgreedAt(now);
        host.setPrivacyAgreedAt(now);
        host.setInformationAccuracyAgreedAt(now);

        int insertedRows = hostMapper.insertHost(host);

        if (insertedRows != 1 || host.getHostId() == null) {
            throw new IllegalStateException("호스트 등록 신청을 저장하지 못했습니다.");
        }

        return new HostApplicationResponse(
                host.getHostId(),
                host.getStatus(),
                true,
                "호스트 등록이 완료되었습니다.",
                now,
                now
        );

    }

    private void validateRequiredAgreements(HostApplicationRequest request) {
        if (request.agreements() == null
                || !request.agreements().hostPolicy()
                || !request.agreements().privacy()
                || !request.agreements().informationAccuracy()) {
            throw new IllegalArgumentException("필수 약관에 모두 동의해야 합니다.");
        }
    }

    private String normalizeBusinessNumber(String businessNumber) {
        String normalized = businessNumber.replaceAll("\\D", "");

        if (normalized.length() != 10) {
            throw new IllegalArgumentException("사업자등록번호는 숫자 10자리여야 합니다.");
        }

        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

}
