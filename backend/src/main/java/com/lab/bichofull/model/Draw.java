package com.lab.bichofull.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "draws")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Draw {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_prize", nullable = false, length = 4)
    private String firstPrize;

    @Column(name = "second_prize", nullable = false, length = 4)
    private String secondPrize;

    @Column(name = "third_prize", nullable = false, length = 4)
    private String thirdPrize;

    @Column(name = "fourth_prize", nullable = false, length = 4)
    private String fourthPrize;

    @Column(name = "fifth_prize", nullable = false, length = 4)
    private String fifthPrize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "draw_date", insertable = false, updatable = false)
    private Instant drawDate;
}