package com.tripflow.auth.sms;

public interface SmsSender {
    void send(String phoneNumber, String message);
}