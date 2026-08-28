package com.tripflow.account.verification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailSender {

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailSender(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String senderEmail
    ) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    public void sendVerificationCode(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(email);
        message.setSubject("[TripFlow] 이메일 인증번호");
        message.setText(
                "TripFlow 이메일 인증번호는 " + code
                        + "입니다.\n\n5분 이내에 입력해주세요."
        );

        mailSender.send(message);
    }
}