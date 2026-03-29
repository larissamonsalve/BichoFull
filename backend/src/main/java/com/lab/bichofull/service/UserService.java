package com.lab.bichofull.service;

import com.lab.bichofull.dto.UserRegistrationDTO;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerUser(UserRegistrationDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        if (userRepository.existsByUsername(dto.username())) {
            throw new IllegalArgumentException("Nome de usuário já em uso.");
        }

        User user = User.builder()
                .name(dto.name())
                .username(dto.username())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password())) // Senha em Hash
                .role(Role.PLAYER) // Todos iniciam como Apostador
                .balance(new BigDecimal("1000.00")) // Saldo inicial fictício
                .build();

        userRepository.save(user);
    }
}