package com.tripflow.account.verification;

public interface SmsSender {
    void send(String phoneNumber, String message);
}
