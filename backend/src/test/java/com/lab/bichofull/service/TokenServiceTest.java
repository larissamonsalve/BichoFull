package com.lab.bichofull.service;

import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import org.junit.jupiter.api.BeforeEach; 
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.util.ReflectionTestUtils;

/**
 * Teste unitário para validar a geração e extração de dados de tokens JWT.
 */
class TokenServiceTest {

    private TokenService tokenService;

    // Configuração executada antes de cada teste
    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        
        // Injetar manualmente o valor da chave secreta no campo privado 'jwtSecret'
        // Isso simula o valor que viria do application.properties no ambiente real
        ReflectionTestUtils.setField(tokenService, "jwtSecret", "BichoFullSecretKeyMuitoSeguraComMaisDe32Caracteres2026!");
    }

    //Valida se o serviço consegue gerar um token para um usuário e depois extrair o username dele.
    @Test
    @DisplayName("Deve gerar um token válido e extrair o username corretamente")
    void deveGerarEValidarToken() {
        // Prepara um usuário de teste
        User user = User.builder()
                .id(1L)
                .username("joaosilva")
                .role(Role.PLAYER)
                .build();

        // Gera o token baseado no usuário
        String token = tokenService.generateToken(user);
        
        // Verifica se o token não é nulo e se o 'subject' extraído é o username esperado
        assertNotNull(token);
        assertEquals("joaosilva", tokenService.getSubject(token));
    }

    //Valida se o sistema se comporta corretamente ao receber um token malformatado.
    @Test
    @DisplayName("Deve retornar null para token inválido")
    void deveRetornarNullParaTokenInvalido() {
        // Define uma string que não segue o padrão JWT
        String tokenInvalido = "token.totalmente.errado";
        
        // Tenta extrair o subject e espera receber null (conforme o try-catch no serviço)
        String subject = tokenService.getSubject(tokenInvalido);
        assertNull(subject);
    }
}