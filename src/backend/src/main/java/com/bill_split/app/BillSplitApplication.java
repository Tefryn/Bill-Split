package com.bill_split.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BillSplitApplication {

    public static void main(String[] args) {
        SpringApplication.run(BillSplitApplication.class, args);
    }
}
