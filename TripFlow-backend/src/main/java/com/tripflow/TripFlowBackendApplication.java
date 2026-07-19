package com.tripflow;

import com.tripflow.auth.config.AuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(AuthProperties.class)
@SpringBootApplication
public class TripFlowBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripFlowBackendApplication.class, args);
    }

}
