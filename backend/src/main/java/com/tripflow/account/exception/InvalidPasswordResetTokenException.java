package com.tripflow.account.exception;

public class InvalidPasswordResetTokenException extends RuntimeException {

    public InvalidPasswordResetTokenException() {
        super("유효하지 않거나 만료된 비밀번호 초기화 토큰입니다.");
    }
}
