package com.lab.bichofull;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;

public abstract class BaseIntegrationTest {

    // PADRÃO SINGLETON: Sem a anotação @Container. 
    // Assim o JUnit não tenta desligar o banco a cada teste, deixando a execução muito mais rápida.
    protected static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("bichofull_test")
            .withUsername("test")
            .withPassword("test");

    static {
        mysql.start(); // Inicia uma única vez quando a primeira classe de teste for carregada
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.flyway.url", mysql::getJdbcUrl);
        registry.add("spring.flyway.user", mysql::getUsername);
        registry.add("spring.flyway.password", mysql::getPassword);
    }
}