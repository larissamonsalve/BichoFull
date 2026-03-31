package com.lab.bichofull.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "bet_mode", nullable = false)
    private BetMode betMode;

    // Adicionado o mapeamento do grupo do animal que faltava!
    @Column(name = "animal_group")
    private Integer animalGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "bet_type", nullable = false)
    private BetType betType;

    @Column(name = "bet_value", nullable = false, length = 4)
    private String betValue;

    @Column(name = "wager_amount", nullable = false)
    private BigDecimal wagerAmount;

    @Builder.Default
    @Column(name = "prize_won")
    private BigDecimal prizeWon = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private BetStatus status = BetStatus.PENDING;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}