package com.tripflow.auth.dto;

public record RefreshResponse(
  String accessToken,
  String tokenType,
  long expiresIn,
  LoginUserResponse user
){
}