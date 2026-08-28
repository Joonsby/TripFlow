package com.tripflow.auth.sms;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiEmptyResponseException;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.exception.SolapiUnknownException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;
import com.tripflow.auth.config.SmsProperties;
import org.springframework.stereotype.Component;

@Component
public class SolapiSmsSender implements SmsSender {

    private final DefaultMessageService messageService;
    private final SmsProperties smsProperties;

    public SolapiSmsSender(SmsProperties smsProperties) {
        this.smsProperties = smsProperties;

        this.messageService = SolapiClient.INSTANCE.createInstance(
                smsProperties.apiKey(),
                smsProperties.apiSecret()
        );
    }

    @Override
    public void send(String phoneNumber, String messageText) {
        Message message = new Message();

        message.setFrom(smsProperties.senderNumber());
        message.setTo(phoneNumber);
        message.setText(messageText);

        try {
            messageService.send(message, null);

        } catch (SolapiMessageNotReceivedException
                | SolapiEmptyResponseException
                | SolapiUnknownException e
        ) {
            throw new IllegalStateException("SMS 발송에 실패했습니다.", e);
        }
    }
}
