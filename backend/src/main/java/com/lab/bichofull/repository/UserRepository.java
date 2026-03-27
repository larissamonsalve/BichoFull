package com.lab.bichofull.repository;

import com.lab.bichofull.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Busca para o login do Apostador [cite: 3]
    Optional<User> findByEmail(String email);
    
    // Busca para o login do Administrador [cite: 5]
    Optional<User> findByUsername(String username);
}