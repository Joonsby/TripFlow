package com.tripflow.account.exception;

public class PasswordConfirmationMismatchException extends RuntimeException {

    public PasswordConfirmationMismatchException() {
        super("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }
}
