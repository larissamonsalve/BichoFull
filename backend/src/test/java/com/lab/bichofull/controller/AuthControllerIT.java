package com.lab.bichofull.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.bichofull.BaseIntegrationTest;
import com.lab.bichofull.dto.LoginDTO;
import com.lab.bichofull.dto.UserRegistrationDTO;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;

import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Tag("integration") 
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class AuthControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Deve autenticar usuário e retornar token 200 OK")
    void deveFazerLoginComSucesso() throws Exception {
        User user = User.builder()
                .name("Teste")
                .username("testeuser")
                .email("teste@email.com")
                .password(passwordEncoder.encode("senha123"))
                .role(Role.PLAYER)
                .balance(BigDecimal.ZERO)
                .build();
        userRepository.save(user);

        LoginDTO loginDTO = new LoginDTO("testeuser", "senha123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.type").value("Bearer"));
    }

    @Test
    @DisplayName("Deve registrar um usuário com sucesso")
    void shouldRegisterUserSuccessfully() throws Exception {
        UserRegistrationDTO dto = new UserRegistrationDTO(
                "Larissa Silva",
                "larissa_software",
                "larissa@email.com",
                "senha123"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Usuário cadastrado com sucesso!"));
    }

    @Test
    @DisplayName("Não deve permitir registro com e-mail duplicado")
    void shouldNotRegisterDuplicateEmail() throws Exception {
        UserRegistrationDTO dto = new UserRegistrationDTO(
                "Teste", "user1", "duplicado@email.com", "123456"
        );
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("E-mail já cadastrado."));
    }

    @Test
    @DisplayName("Não deve permitir registro com senha menor que 6 caracteres")
    void shouldNotRegisterWithShortPassword() throws Exception {
        UserRegistrationDTO dto = new UserRegistrationDTO(
                "Teste Senha",
                "user_senha",
                "senha@email.com",
                "12345" 
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}