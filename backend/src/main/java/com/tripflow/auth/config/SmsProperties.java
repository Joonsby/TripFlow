package com.tripflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tripflow.sms")
public record SmsProperties(
        String apiKey,
        String apiSecret,
        String senderNumber,
        String kakaoPfId,
        String kakaoTemplateId
) {
}