package com.tripflow.auth.dto;

public record LoginUserResponse (
    Integer userId,
    String email,
    String name
) {
}
