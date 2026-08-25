package com.tripflow.host.dto;

import com.tripflow.host.domain.HostStatus;

import java.time.LocalDateTime;

public record HostApplicationResponse(
        Integer hostId,
        HostStatus status,
        boolean isHost,
        String message,
        LocalDateTime appliedAt,
        LocalDateTime approvedAt
) {
}
