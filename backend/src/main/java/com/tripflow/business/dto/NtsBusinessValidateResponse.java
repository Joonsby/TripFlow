package com.tripflow.business.dto;

import java.util.List;

public record NtsBusinessValidateResponse(
        List<Data> data
) {
    public record Data(
            String valid,
            Status status
    ) {}

    public record Status(
            String b_stt_cd
    ) {}
}