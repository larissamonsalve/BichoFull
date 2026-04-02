package com.lab.bichofull;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class BichofullApplication {

	@PostConstruct
    public void init() {
        // Força a JVM a rodar em UTC para evitar conflitos com o S.O do Docker
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

	public static void main(String[] args) {
		SpringApplication.run(BichofullApplication.class, args);
	}

}
