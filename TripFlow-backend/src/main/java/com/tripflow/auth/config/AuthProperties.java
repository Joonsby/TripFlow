package com.tripflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tripflow.auth")
public record AuthProperties(
        String jwtSecret,
        long accessTokenMinutes,
        long refreshTokenDays,
        boolean cookieSecure
) {
}