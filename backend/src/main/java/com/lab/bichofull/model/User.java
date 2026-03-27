package com.lab.bichofull.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; [cite: 3, 5]

    @Column(unique = true)
    private String username; [cite: 5]

    @Column(unique = true, nullable = false)
    private String email; [cite: 3, 66]

    @Column(nullable = false)
    private String password; [cite: 3, 5, 84]

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; [cite: 2]

    // RN: Saldo inicial de 1000 e nunca negativo [cite: 16, 37, 69, 90]
    @DecimalMin(value = "0.00", message = "O saldo não pode ser negativo")
    @Column(precision = 10, scale = 2)
    private BigDecimal balance = new BigDecimal("1000.00"); [cite: 69]

    public enum Role {
        PLAYER, ADMIN [cite: 2]
    }
}