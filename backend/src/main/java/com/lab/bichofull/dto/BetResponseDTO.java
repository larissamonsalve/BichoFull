package com.lab.bichofull.dto;

import com.lab.bichofull.model.BetMode;
import com.lab.bichofull.model.BetStatus;
import com.lab.bichofull.model.BetType;
import java.math.BigDecimal;
import java.time.Instant;

public record BetResponseDTO(
    Long id,
    String username,
    String email,
    BetType betType,
    BetMode betMode,
    String betValue,
    BigDecimal wagerAmount,
    BigDecimal prizeWon,
    BetStatus status,
    Instant createdAt
) {}