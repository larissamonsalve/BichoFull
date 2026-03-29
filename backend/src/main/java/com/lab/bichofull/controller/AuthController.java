package com.lab.bichofull.controller;

import com.lab.bichofull.dto.LoginDTO;
import com.lab.bichofull.dto.TokenDTO;
import com.lab.bichofull.dto.UserRegistrationDTO;

import com.lab.bichofull.model.User;

import com.lab.bichofull.repository.UserRepository;

import com.lab.bichofull.service.TokenService;
import com.lab.bichofull.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            userService.registerUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        // Busca o usuário no banco pelo username OU pelo email (passamos o mesmo valor para ambos)
        User user = userRepository.findByUsernameOrEmail(loginDTO.login(), loginDTO.login())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        // Verifica se a senha bate com o hash
        if (passwordEncoder.matches(loginDTO.password(), user.getPassword())) {
            // Gera o token JWT
            String token = tokenService.generateToken(user);
            return ResponseEntity.ok(new TokenDTO(token, "Bearer"));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta.");
    }
}