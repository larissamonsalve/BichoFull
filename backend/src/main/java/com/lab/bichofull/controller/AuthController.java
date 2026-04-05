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

/**
 * Controller responsável pela autenticação e registro de usuários.
 */
//@CrossOrigin(origins = "http://localhost:4200") // Permite requisições do frontend Angular
@RestController
@RequestMapping("/api/auth") // Define o prefixo das rotas de autenticação
@RequiredArgsConstructor // Injeta automaticamente as dependências via construtor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    // Endpoint para cadastrar um novo usuário no sistema
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegistrationDTO dto) {
        // O serviço valida duplicidade e salva o usuário com senha em hash
        userService.registerUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
    }

    //Endpoint para realizar o login e obter o token de acesso.
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        // Busca o usuário no banco pelo username ou pelo email
        User user = userRepository.findByUsernameOrEmail(loginDTO.login(), loginDTO.login())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        // Verifica se a senha fornecida corresponde ao hash armazenado
        if (passwordEncoder.matches(loginDTO.password(), user.getPassword())) {
            // Gera um novo token JWT válido por 2 horas
            String token = tokenService.generateToken(user);
            return ResponseEntity.ok(new TokenDTO(token, "Bearer"));
        }

        // Retorna erro 401 caso a senha esteja incorreta
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta.");
    }
}