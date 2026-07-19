package com.tripflow.auth.dto;

public record LoginResult (
    LoginResponse response,
    String refreshToken,
    long refreshTokenMaxAgeSeconds
){
}
