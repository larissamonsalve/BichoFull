package com.lab.bichofull.service;

import com.lab.bichofull.dto.BetDTO;
import com.lab.bichofull.model.Bet;
import com.lab.bichofull.model.BetMode;
import com.lab.bichofull.model.BetType;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BetServiceTest {

    @Mock
    private BetRepository betRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BetService betService;

    @Captor
    private ArgumentCaptor<Bet> betCaptor;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("jogador_teste")
                .balance(new BigDecimal("500.00"))
                .build();
    }

    @Test
    @DisplayName("Deve registrar aposta com sucesso, deduzir saldo e calcular o grupo do animal (Milhar)")
    void shouldPlaceBetSuccessfully() {
        // Arrange
        BetDTO dto = new BetDTO(BetType.THOUSANDS, BetMode.SIMPLE, "1242", new BigDecimal("100.00"));
        // Final "42" pertence ao Cavalo (Grupo 11) -> 42 / 4 = 10.5 (Arredonda para 11)

        // Act
        betService.placeBet(dto, user);

        // Assert
        verify(userRepository, times(1)).save(user);
        verify(betRepository, times(1)).save(betCaptor.capture());

        Bet savedBet = betCaptor.getValue();
        
        assertThat(user.getBalance()).isEqualByComparingTo(new BigDecimal("400.00")); // Saldo debitado
        assertThat(savedBet.getUser()).isEqualTo(user);
        assertThat(savedBet.getBetType()).isEqualTo(BetType.THOUSANDS);
        assertThat(savedBet.getBetValue()).isEqualTo("1242");
        assertThat(savedBet.getAnimalGroup()).isEqualTo(11); // Verificou a regra de negócio do bicho
    }

    @Test
    @DisplayName("Deve registrar corretamente uma aposta na Vaca (Grupo 25) quando a dezena for 00")
    void shouldCalculateCowGroupCorrectly() {
        // Arrange
        BetDTO dto = new BetDTO(BetType.TENS, BetMode.SURROUNDED, "00", new BigDecimal("50.00"));

        // Act
        betService.placeBet(dto, user);

        // Assert
        verify(betRepository).save(betCaptor.capture());
        Bet savedBet = betCaptor.getValue();
        
        // A regra especial dita que final 00 é Vaca (25)
        assertThat(savedBet.getAnimalGroup()).isEqualTo(25);
    }

    @Test
    @DisplayName("Deve falhar e não salvar aposta se o usuário não tiver saldo (Fail-Fast)")
    void shouldNotPlaceBetWhenInsufficientBalance() {
        // Arrange
        BetDTO dto = new BetDTO(BetType.GROUP, BetMode.SIMPLE, "15", new BigDecimal("1000.00")); // R$ 1000 > R$ 500

        // Act & Assert
        assertThatThrownBy(() -> betService.placeBet(dto, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Saldo insuficiente.");

        // Garante que nenhuma operação no banco foi realizada devido a falha rápida
        verify(userRepository, never()).save(any());
        verify(betRepository, never()).save(any());
    }
}