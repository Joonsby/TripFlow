package com.tripflow.business.dto;

public record BusinessVerificationResponse (
        boolean verified,
        String message
)
{
}