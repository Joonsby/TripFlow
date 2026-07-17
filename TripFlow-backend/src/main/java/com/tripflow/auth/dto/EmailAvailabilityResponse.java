package com.tripflow.auth.dto;

public record EmailAvailabilityResponse(
        String email,
        boolean available
) {
}