package com.tripflow.host.exception;

public class DuplicateHostApplicationException extends RuntimeException {

    public DuplicateHostApplicationException() {
        super("이미 호스트 등록 신청 내역이 있습니다.");
    }

    public DuplicateHostApplicationException(String message) {
        super(message);
    }
}
