package com.lab.bichofull.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.bichofull.BaseIntegrationTest;
import com.lab.bichofull.dto.CustomDrawDTO;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;
import com.lab.bichofull.service.TokenService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthorizationIT extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Deve retornar 403 Forbidden se um PLAYER tentar forçar um sorteio manipulado")
    void shouldBlockPlayerFromTriggeringDraw() throws Exception {
        // Arrange: Cria um jogador comum
        User player = userRepository.saveAndFlush(User.builder()
                .name("Jogador Comum")
                .username("player_hacker")
                .email("hacker@fake.com")
                .password("hash")
                .role(Role.PLAYER) // Role é PLAYER, não ADMIN
                .balance(new BigDecimal("100.00"))
                .build());

        String playerToken = tokenService.generateToken(player);
        CustomDrawDTO maliciousDto = new CustomDrawDTO("1111", "2222", "3333", "4444", "5555");

        // Act & Assert: Tenta acessar rota de admin com token de player
        mockMvc.perform(post("/api/admin/draws/custom")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(maliciousDto)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @DisplayName("Deve retornar 403 Forbidden se requisição não tiver token (Não Autenticado)")
    void shouldBlockUnauthenticatedAccess() throws Exception {
        // Rota protegida sem enviar o Header Authorization
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Deve retornar 403 Forbidden se o token for forjado ou inválido")
    void shouldBlockInvalidToken() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer token_inventado_totalmente_invalido"))
                .andExpect(status().isForbidden());
    }
}