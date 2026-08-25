package com.tripflow.host.exception;

public class DuplicateBusinessNumberException extends RuntimeException {

    public DuplicateBusinessNumberException() {
        super("이미 등록된 사업자등록번호입니다.");
    }

    public DuplicateBusinessNumberException(String message) {
        super(message);
    }
}
