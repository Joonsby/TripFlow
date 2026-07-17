package com.tripflow.auth.controller;

import com.tripflow.auth.dto.EmailAvailabilityResponse;
import com.tripflow.auth.dto.SignupRequest;
import com.tripflow.auth.dto.SignupResponse;
import com.tripflow.auth.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    @GetMapping("/email-availability")
    public EmailAvailabilityResponse checkEmailAvailability(
            @RequestParam
            @NotBlank
            @Email
            String email
    ) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        boolean available = authService.isEmailAvailable(normalizedEmail);

        return new EmailAvailabilityResponse(normalizedEmail, available);
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        SignupResponse response = authService.signup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}