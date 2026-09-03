package com.tripflow.account.exception;

public class SamePasswordException extends RuntimeException {

    public SamePasswordException() {
        super("이전 비밀번호와 동일하게 변경할 수 없습니다.");
    }
}
