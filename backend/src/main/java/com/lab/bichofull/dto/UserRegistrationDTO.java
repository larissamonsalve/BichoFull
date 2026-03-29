package com.lab.bichofull.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegistrationDTO(
    @NotBlank(message = "O nome é obrigatório") String name,
    @NotBlank(message = "O nome de usuário é obrigatório") String username,
    @Email(message = "Formato de e-mail inválido") @NotBlank String email,
    @NotBlank @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres") String password
) {}