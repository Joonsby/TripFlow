package com.tripflow.host.controller;

import com.tripflow.host.dto.HostApplicationRequest;
import com.tripflow.host.dto.HostApplicationResponse;
import com.tripflow.host.service.HostApplicationService;
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
public class HostApplicationController {
    private final HostApplicationService hostApplicationService;

    @PostMapping
    public ResponseEntity<HostApplicationResponse> apply(
            Authentication authentication,
            @Valid @RequestBody HostApplicationRequest request
    ){
        Integer userId = Integer.valueOf(authentication.getName());
        HostApplicationResponse response = hostApplicationService.apply(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
