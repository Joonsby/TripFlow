package com.tripflow.business.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record NtsBusinessValidateRequest (
        List<Business> businesses
){
    public record Business(
            @JsonProperty("b_no")
            String businessNumber,

            @JsonProperty("start_dt")
            String startDate,

            @JsonProperty("p_nm")
            String representativeName,

            @JsonProperty("b_nm")
            String businessName
    ) {
    }
}
