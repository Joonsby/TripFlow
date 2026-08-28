package com.tripflow.global.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    private static final List<String> ALLOWED_METHODS = List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
    );

    private static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization",
            "Content-Type"
    );

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties properties) {
        List<String> origins = properties.allowedOrigins();

        if (origins == null || origins.isEmpty()) {
            throw new IllegalStateException("tripflow.cors.allowed-origins 가 비어 있습니다.");
        }

        // allowCredentials=true 와 와일드카드 origin 은 브라우저가 거부한다.
        // 설정 실수를 런타임이 아니라 기동 시점에 잡는다.
        if (origins.contains(CorsConfiguration.ALL)) {
            throw new IllegalStateException(
                    "allowCredentials=true 이므로 origin 에 '*' 를 쓸 수 없습니다. "
                            + "허용할 도메인을 명시하세요."
            );
        }

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(ALLOWED_METHODS);
        configuration.setAllowedHeaders(ALLOWED_HEADERS);
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
