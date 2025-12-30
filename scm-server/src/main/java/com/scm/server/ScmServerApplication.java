package com.scm.server;

import com.scm.server.service.AuthenticationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ScmServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScmServerApplication.class, args);
    }

    @Bean
    public CommandLineRunner verifyInitialData(AuthenticationService authService) {
        return args -> {
            authService.createInitialAdmin();
        };
    }

}
