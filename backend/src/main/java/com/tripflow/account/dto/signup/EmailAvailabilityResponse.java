package com.tripflow.account.dto.signup;

public record EmailAvailabilityResponse(
        String email,
        boolean available
) {
}
