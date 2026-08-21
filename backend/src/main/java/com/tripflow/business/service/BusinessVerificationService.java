package com.tripflow.business.service;

import com.tripflow.business.dto.BusinessVerificationRequest;
import com.tripflow.business.dto.BusinessVerificationResponse;
import com.tripflow.business.dto.NtsBusinessValidateRequest;
import com.tripflow.business.dto.NtsBusinessValidateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.DefaultUriBuilderFactory;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class BusinessVerificationService {

    private final RestClient restClient;
    private final String serviceKey;

    public BusinessVerificationService(
            @Value("${external.nts.base-url}") String baseUrl,
            @Value("${external.nts.service-key}") String serviceKey
    ) {
        DefaultUriBuilderFactory uriBuilderFactory =
                new DefaultUriBuilderFactory(baseUrl);
        uriBuilderFactory.setEncodingMode(
                DefaultUriBuilderFactory.EncodingMode.NONE
        );

        this.restClient = RestClient.builder()
                .uriBuilderFactory(uriBuilderFactory)
                .build();

        this.serviceKey = serviceKey;
    }

    public BusinessVerificationResponse verify(
            BusinessVerificationRequest request
    ) {
        String businessNumber = request.businessNumber().replace("-", "");
        String startDate = request.openingDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        NtsBusinessValidateRequest apiRequest =
                new NtsBusinessValidateRequest(
                        List.of(
                                new NtsBusinessValidateRequest.Business(
                                        businessNumber,
                                        startDate,
                                        request.representativeName(),
                                        request.businessName()
                                )
                        )
                );

        NtsBusinessValidateResponse apiResponse =
                restClient.post()
                        .uri(uriBuilder -> uriBuilder
                                .path("/validate")
                                .queryParam("serviceKey", "{serviceKey}")
                                .build(serviceKey)
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(apiRequest)
                        .retrieve()
                        .body(NtsBusinessValidateResponse.class);

        if (apiResponse == null || apiResponse.data() == null || apiResponse.data().isEmpty()) {
            throw new IllegalStateException("사업자등록 확인 API 응답이 올바르지 않습니다.");
        }

        NtsBusinessValidateResponse.Data data = apiResponse.data().getFirst();

        // 진위확인 실패
        if (!"01".equals(data.valid())) {
            return new BusinessVerificationResponse(
                    false,
                    "입력한 사업자 정보가 일치하지 않습니다."
            );
        }

        // status 자체가 없는 경우
        if (data.status() == null) {
            return new BusinessVerificationResponse(
                    false,
                    "사업자 상태 정보를 확인할 수 없습니다."
            );
        }

        // 계속사업자가 아닌 경우
        if (!"01".equals(data.status().b_stt_cd())) {
            return new BusinessVerificationResponse(
                    false,
                    "현재 계속사업 상태인 사업자가 아닙니다."
            );
        }

        return new BusinessVerificationResponse(
                true,
                "사업자 정보가 확인되었습니다."
        );
    }
}
