package com.bill_split.app.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class DotenvConfig {
    @PostConstruct
    public void loadEnv() {
        Path envDir = Paths.get(System.getProperty("user.dir"), "..")
            .normalize()
            .toAbsolutePath();

        Dotenv dotenv = Dotenv.configure()
            .directory(envDir.toString())
            .ignoreIfMissing()
            .load();

        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
    }
}
