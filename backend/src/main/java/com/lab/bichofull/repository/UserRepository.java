package com.lab.bichofull.repository;

import com.lab.bichofull.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findFirstByRole(com.lab.bichofull.model.Role role);
}