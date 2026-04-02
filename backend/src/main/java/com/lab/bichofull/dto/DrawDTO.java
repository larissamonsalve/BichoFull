package com.lab.bichofull.dto;

import java.time.Instant;

public record DrawDTO(
    Long id,
    String firstPrize,
    String secondPrize,
    String thirdPrize,
    String fourthPrize,
    String fifthPrize,
    Instant drawDate
) {}