package com.tripflow.host.service;

import com.tripflow.business.dto.BusinessVerificationResponse;
import com.tripflow.business.service.BusinessVerificationService;
import com.tripflow.host.domain.Host;
import com.tripflow.host.domain.HostStatus;
import com.tripflow.host.dto.HostAgreementRequest;
import com.tripflow.host.dto.HostApplicationRequest;
import com.tripflow.host.dto.HostApplicationResponse;
import com.tripflow.host.exception.BusinessVerificationFailedException;
import com.tripflow.host.mapper.HostMapper;
import com.tripflow.user.domain.User;
import com.tripflow.user.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HostApplicationServiceTest {

    private HostMapper hostMapper;
    private UserMapper userMapper;
    private BusinessVerificationService businessVerificationService;
    private HostApplicationService service;

    @BeforeEach
    void setUp() {
        hostMapper = mock(HostMapper.class);
        userMapper = mock(UserMapper.class);
        businessVerificationService = mock(BusinessVerificationService.class);
        service = new HostApplicationService(
                hostMapper,
                userMapper,
                businessVerificationService
        );
    }

    @Test
    void verifiedBusinessIsApprovedImmediately() {
        User user = new User();
        user.setUserId(13);
        when(userMapper.findById(13)).thenReturn(user);
        when(businessVerificationService.verify(any()))
                .thenReturn(new BusinessVerificationResponse(true, "verified"));
        when(hostMapper.insertHost(any())).thenAnswer(invocation -> {
            Host host = invocation.getArgument(0);
            host.setHostId(7);
            return 1;
        });

        HostApplicationResponse response = service.apply(13, request());

        assertEquals(7, response.hostId());
        assertEquals(HostStatus.APPROVED, response.status());
        assertTrue(response.isHost());
        assertNotNull(response.appliedAt());
        assertNotNull(response.approvedAt());
    }

    @Test
    void failedBusinessVerificationDoesNotCreateHost() {
        User user = new User();
        user.setUserId(13);
        when(userMapper.findById(13)).thenReturn(user);
        when(businessVerificationService.verify(any()))
                .thenReturn(new BusinessVerificationResponse(false, "verification failed"));

        assertThrows(
                BusinessVerificationFailedException.class,
                () -> service.apply(13, request())
        );

        verify(hostMapper, never()).insertHost(any());
    }

    private HostApplicationRequest request() {
        return new HostApplicationRequest(
                "TripFlow Stay",
                "Test Owner",
                "1234567890",
                LocalDate.of(2024, 1, 1),
                "04524",
                "서울특별시 중구 세종대로 110",
                "3층",
                new BigDecimal("37.5662952"),
                new BigDecimal("126.9779451"),
                "테스트 호스트",
                new HostAgreementRequest(true, true, true)
        );
    }
}
