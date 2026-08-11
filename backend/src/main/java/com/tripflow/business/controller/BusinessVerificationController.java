package com.tripflow.business.controller;

import com.tripflow.business.dto.BusinessVerificationRequest;
import com.tripflow.business.dto.BusinessVerificationResponse;
import com.tripflow.business.service.BusinessVerificationService;
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
public class BusinessVerificationController {

    private final BusinessVerificationService businessVerificationService;

    @PostMapping
    public ResponseEntity<BusinessVerificationResponse> verify(
            @Valid @RequestBody BusinessVerificationRequest request
            ){
                BusinessVerificationResponse response = businessVerificationService.verify(request);

                return ResponseEntity.ok(response);
    }
}
