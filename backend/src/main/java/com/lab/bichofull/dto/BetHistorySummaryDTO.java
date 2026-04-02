package com.lab.bichofull.dto;

import java.math.BigDecimal;

public record BetHistorySummaryDTO(
    long totalBets,
    double winRate,
    BigDecimal totalWon,
    BigDecimal totalLost
) {}