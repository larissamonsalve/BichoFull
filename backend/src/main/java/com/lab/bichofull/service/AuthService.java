package com.lab.bichofull.service;

import com.lab.bichofull.dto.UserDTO;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(UserDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        
        // RNF03: Criptografando a senha antes de salvar
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        // RN: Definindo papel padrão como PLAYER (Apostador)
        user.setRole(User.Role.PLAYER);
        
        // O saldo de 1000.00 já é inicializado na Entidade User.java
        return userRepository.save(user);
    }
}