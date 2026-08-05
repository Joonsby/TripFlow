package com.tripflow.auth.token;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import lombok.RequiredArgsConstructor;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Component;

import com.tripflow.auth.config.AuthProperties;

@Component
@RequiredArgsConstructor
public class AccessTokenProvider {

    private static final String ISSUER = "tripflow";

    private final JwtEncoder jwtEncoder;
    private final AuthProperties authProperties;

    public String createAccessToken(
            Integer userId,
            String email
    ) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(
                authProperties.accessTokenMinutes(),
                ChronoUnit.MINUTES
        );

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("email", email)
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        JwtEncoderParameters parameters =
                JwtEncoderParameters.from(header, claims);

        return jwtEncoder.encode(parameters)
                .getTokenValue();
    }

    public long getExpiresInSeconds() {
        return authProperties.accessTokenMinutes() * 60;
    }
}