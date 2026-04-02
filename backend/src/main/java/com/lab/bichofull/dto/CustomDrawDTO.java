package com.lab.bichofull.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CustomDrawDTO(
    @NotBlank @Pattern(regexp = "\\d{4}", message = "O prêmio deve ter exatos 4 dígitos") String firstPrize,
    @NotBlank @Pattern(regexp = "\\d{4}", message = "O prêmio deve ter exatos 4 dígitos") String secondPrize,
    @NotBlank @Pattern(regexp = "\\d{4}", message = "O prêmio deve ter exatos 4 dígitos") String thirdPrize,
    @NotBlank @Pattern(regexp = "\\d{4}", message = "O prêmio deve ter exatos 4 dígitos") String fourthPrize,
    @NotBlank @Pattern(regexp = "\\d{4}", message = "O prêmio deve ter exatos 4 dígitos") String fifthPrize
) {}