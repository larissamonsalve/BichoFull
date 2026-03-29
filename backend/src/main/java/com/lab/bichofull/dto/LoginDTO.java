package com.lab.bichofull.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDTO(
    @NotBlank(message = "O e-mail ou nome de usuário é obrigatório") String login,
    @NotBlank(message = "A senha é obrigatória") String password
) {}