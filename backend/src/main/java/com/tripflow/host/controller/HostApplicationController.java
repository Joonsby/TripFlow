package com.tripflow.host.controller;

import com.tripflow.host.dto.HostApplicationRequest;
import com.tripflow.host.dto.HostApplicationResponse;
import com.tripflow.host.service.HostApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/host-applications")
@Tag(name = "호스트 등록", description = "로그인 회원의 사업자 정보 확인 및 호스트 등록 API")
public class HostApplicationController {
    private final HostApplicationService hostApplicationService;

    @PostMapping
    @Operation(summary = "호스트 등록", description = "로그인 회원의 사업자등록정보와 필수 동의를 확인하고 호스트 계정을 등록합니다.")
    public ResponseEntity<HostApplicationResponse> apply(
            Authentication authentication,
            @Valid @RequestBody HostApplicationRequest request
    ) {
        Integer userId = Integer.valueOf(authentication.getName());
        HostApplicationResponse response = hostApplicationService.apply(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
