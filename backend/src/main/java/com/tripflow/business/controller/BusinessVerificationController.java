package com.tripflow.business.controller;

import com.tripflow.business.dto.BusinessVerificationRequest;
import com.tripflow.business.dto.BusinessVerificationResponse;
import com.tripflow.business.service.BusinessVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/business-verifications")
@RequiredArgsConstructor
@Tag(name = "사업자 확인", description = "국세청 사업자등록정보를 이용한 사업자 진위 및 상태 확인 API")
public class BusinessVerificationController {

    private final BusinessVerificationService businessVerificationService;

    @PostMapping
    @Operation(
        summary = "사업자등록정보 확인",
        description = "사업자등록번호, 개업일자, 대표자명과 상호명을 국세청 정보와 대조하고 계속사업 상태를 확인합니다."
    )
    public ResponseEntity<BusinessVerificationResponse> verify(
        @Valid @RequestBody BusinessVerificationRequest request
    ) {
        BusinessVerificationResponse response = businessVerificationService.verify(request);
        return ResponseEntity.ok(response);
    }
}
