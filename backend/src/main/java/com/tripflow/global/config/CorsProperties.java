package com.tripflow.global.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tripflow.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {
}
