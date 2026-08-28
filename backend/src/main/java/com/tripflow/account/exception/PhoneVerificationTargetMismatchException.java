package com.tripflow.account.exception;

public class PhoneVerificationTargetMismatchException extends RuntimeException {

    public PhoneVerificationTargetMismatchException() {
        super("입력한 회원 정보를 확인할 수 없습니다.");
    }
}
