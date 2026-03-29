package com.lab.bichofull.service;

import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import org.junit.jupiter.api.BeforeEach; 
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.util.ReflectionTestUtils;

class TokenServiceTest {

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        // 1. Criamos a instância pura da classe
        tokenService = new TokenService();
        
        // 2. Usamos o Reflection para colocar a chave no campo privado 'jwtSecret'
        // O nome "jwtSecret" deve ser IGUAL ao nome da variável lá no TokenService.java
        ReflectionTestUtils.setField(tokenService, "jwtSecret", "BichoFullSecretKeyMuitoSeguraParaGerarOJWT2026!");
    }

    @Test
    @DisplayName("Deve gerar um token válido e extrair o username corretamente")
    void deveGerarEValidarToken() {
        User user = User.builder()
                .id(1L)
                .username("joaosilva")
                .role(Role.PLAYER)
                .build();

        String token = tokenService.generateToken(user);
        
        assertNotNull(token);
        assertEquals("joaosilva", tokenService.getSubject(token));
    }

    @Test
    @DisplayName("Deve retornar null para token inválido")
    void deveRetornarNullParaTokenInvalido() {
        String tokenInvalido = "token.totalmente.errado";
        String subject = tokenService.getSubject(tokenInvalido);
        assertNull(subject);
    }
}