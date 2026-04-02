package com.lab.bichofull.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        // Inicializa um usuário com R$ 1000,00 de saldo antes de cada teste
        user = User.builder()
                .id(1L)
                .username("jogador1")
                .balance(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    @DisplayName("Deve debitar o saldo corretamente quando o valor for válido e suficiente")
    void shouldDebitBalanceSuccessfully() {
        // Arrange
        BigDecimal wagerAmount = new BigDecimal("150.00");

        // Act
        user.debitBalance(wagerAmount);

        // Assert
        assertThat(user.getBalance()).isEqualByComparingTo(new BigDecimal("850.00"));
    }

    @Test
    @DisplayName("Não deve permitir débito e deve lançar exceção quando o saldo for insuficiente")
    void shouldThrowExceptionWhenInsufficientBalance() {
        // Arrange
        BigDecimal wagerAmount = new BigDecimal("1500.00"); // Maior que 1000

        // Act & Assert
        assertThatThrownBy(() -> user.debitBalance(wagerAmount))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Saldo insuficiente.");
        
        // Garante que o saldo permaneceu intacto
        assertThat(user.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    @Test
    @DisplayName("Não deve permitir débito de valores negativos ou zerados")
    void shouldThrowExceptionWhenAmountIsInvalid() {
        // Arrange
        BigDecimal zeroWager = BigDecimal.ZERO;
        BigDecimal negativeWager = new BigDecimal("-50.00");

        // Act & Assert para Zero
        assertThatThrownBy(() -> user.debitBalance(zeroWager))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O valor da aposta deve ser maior que zero.");

        // Act & Assert para Negativo
        assertThatThrownBy(() -> user.debitBalance(negativeWager))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O valor da aposta deve ser maior que zero.");
    }
}