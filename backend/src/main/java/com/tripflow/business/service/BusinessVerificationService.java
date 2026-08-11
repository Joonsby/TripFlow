package com.tripflow.business.service;

import com.tripflow.business.dto.BusinessVerificationRequest;
import com.tripflow.business.dto.BusinessVerificationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class BusinessVerificationService {

//    private final RestClient restClient;
//    private final String serviceKey;

    public BusinessVerificationResponse verify(BusinessVerificationRequest request){
        String businessNumber = request.businessNumber().replace("-","");

        boolean verified = businessNumber.equals("1111111111") && request.representativeName().equals("이준섭");

        if(verified){
            return new BusinessVerificationResponse(true,"사업자 정보가 확인되었습니다.");
        }

        return new BusinessVerificationResponse(false,"입력한 사업자 정보가 일치하지 않습니다.");
    }
}
