package com.lab.bichofull;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;

/**
 * Classe base para todos os testes de integração.
 * Utiliza Testcontainers para subir um banco MySQL real dentro de um container Docker durante os testes.
 */
public abstract class BaseIntegrationTest {

    // PADRÃO SINGLETON: Configura uma instância única do MySQL para todos os testes.
    // Isso evita que o Docker suba e desça o banco a cada classe de teste, poupando tempo.
    protected static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("bichofull_test")
            .withUsername("test")
            .withPassword("test");

    // Bloco estático que garante a inicialização do container assim que a classe é carregada.
    static {
        mysql.start(); 
    }

    /**
     * Registra as propriedades do banco de dados dinamicamente.
     * Como o Docker escolhe portas aleatórias, este método informa ao Spring quais são as URLs e credenciais geradas.
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Vincula a URL, usuário e senha do container ao Datasource do Spring
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        
        // Vincula as mesmas configurações ao Flyway para que as migrações SQL sejam aplicadas no banco de teste
        registry.add("spring.flyway.url", mysql::getJdbcUrl);
        registry.add("spring.flyway.user", mysql::getUsername);
        registry.add("spring.flyway.password", mysql::getPassword);
    }
}