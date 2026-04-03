package com.lab.bichofull.repository;

import com.lab.bichofull.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Interface que gerencia as operações de banco de dados para a entidade User
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Verifica se já existe um usuário cadastrado com o e-mail fornecido
    boolean existsByEmail(String email);
    
    // Verifica se já existe um usuário cadastrado com o nome de usuário fornecido
    boolean existsByUsername(String username);
    
    // Busca um usuário pelo seu nome de usuário
    Optional<User> findByUsername(String username);

    // Busca um usuário que possua o username OU o e-mail informado (usado no login)
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    // Busca o primeiro usuário encontrado com um cargo específico (ex: busca um ADMIN para sorteios)
    Optional<User> findFirstByRole(com.lab.bichofull.model.Role role);
}