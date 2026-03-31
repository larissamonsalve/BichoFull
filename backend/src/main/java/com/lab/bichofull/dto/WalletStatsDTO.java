// main/java/com/lab/bichofull/dto/WalletStatsDTO.java
package com.lab.bichofull.dto;

import java.math.BigDecimal;

public record WalletStatsDTO(
    BigDecimal balance,
    BigDecimal totalWon,
    BigDecimal totalLost,
    BigDecimal totalPending,
    BigDecimal netProfit,
    long pendingBetsCount
) {}