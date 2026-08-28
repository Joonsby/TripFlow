package com.tripflow;

import com.tripflow.auth.config.AuthProperties;
import com.tripflow.auth.config.SmsProperties;
import com.tripflow.global.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties({
        AuthProperties.class,
        SmsProperties.class,
        CorsProperties.class
})
@SpringBootApplication
public class TripFlowBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripFlowBackendApplication.class, args);
    }

}
