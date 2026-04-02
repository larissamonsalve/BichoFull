package com.lab.bichofull.service;

import com.lab.bichofull.dto.CustomDrawDTO;
import com.lab.bichofull.model.*;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.repository.DrawRepository;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DrawServiceTest {

    @Mock
    private DrawRepository drawRepository;

    @Mock
    private BetRepository betRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DrawService drawService;

    @Captor
    private ArgumentCaptor<List<Bet>> betListCaptor;

    private User admin;
    private User player;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).username("admin").role(Role.ADMIN).build();
        player = User.builder().id(2L).username("jogador").balance(new BigDecimal("1000.00")).build();
        
        // Simula o salvamento do sorteio retornando ele mesmo
        when(drawRepository.save(any(Draw.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Deve calcular corretamente aposta SIMPLES no GRUPO (18x) - Vaca (00)")
    void shouldCalculateSimpleGroupBetWinner() {
        // Arrange
        Bet bet = Bet.builder()
                .user(player)
                .betType(BetType.GROUP)
                .betMode(BetMode.SIMPLE)
                .animalGroup(25) // Grupo 25 = Vaca
                .wagerAmount(new BigDecimal("10.00")) // Aposta 10 reais
                .status(BetStatus.PENDING)
                .build();

        when(betRepository.findByStatus(BetStatus.PENDING)).thenReturn(List.of(bet));

        // 1º prêmio final 00 (Vaca). Em aposta SIMPLE, só o 1º prêmio importa.
        CustomDrawDTO drawResult = new CustomDrawDTO("5600", "1234", "1234", "1234", "1234");

        // Act
        drawService.performCustomDraw(admin, drawResult);

        // Assert
        verify(betRepository).saveAll(betListCaptor.capture());
        Bet processedBet = betListCaptor.getValue().get(0);

        assertThat(processedBet.getStatus()).isEqualTo(BetStatus.WINNER);
        // Ganho: 10 * 18 = 180
        assertThat(processedBet.getPrizeWon()).isEqualByComparingTo(new BigDecimal("180.00"));
        // Saldo do jogador foi atualizado: 1000 + 180 = 1180
        assertThat(player.getBalance()).isEqualByComparingTo(new BigDecimal("1180.00"));
    }

    @Test
    @DisplayName("Deve calcular corretamente aposta CERCADA na DEZENA (60x) com 3 acertos")
    void shouldCalculateSurroundedTensBetWithMultipleMatches() {
        // Arrange
        Bet bet = Bet.builder()
                .user(player)
                .betType(BetType.TENS)
                .betMode(BetMode.SURROUNDED)
                .betValue("42")
                .wagerAmount(new BigDecimal("50.00")) // R$ 50 divididos por 5 = R$ 10 base
                .status(BetStatus.PENDING)
                .build();

        when(betRepository.findByStatus(BetStatus.PENDING)).thenReturn(List.of(bet));

        // Saiu a dezena "42" no 2º, 3º e 5º prêmios.
        CustomDrawDTO drawResult = new CustomDrawDTO("1111", "9942", "8842", "2222", "7742");

        // Act
        drawService.performCustomDraw(admin, drawResult);

        // Assert
        verify(betRepository).saveAll(betListCaptor.capture());
        Bet processedBet = betListCaptor.getValue().get(0);

        assertThat(processedBet.getStatus()).isEqualTo(BetStatus.WINNER);
        // Base = 50 / 5 = 10. Multiplicador = 60. Acertos = 3. 
        // Winnings = 10 * 60 * 3 = 1800
        assertThat(processedBet.getPrizeWon()).isEqualByComparingTo(new BigDecimal("1800.00"));
        assertThat(player.getBalance()).isEqualByComparingTo(new BigDecimal("2800.00"));
    }

    @Test
    @DisplayName("Deve processar como PERDEDORA aposta na MILHAR que não saiu na cabeça")
    void shouldMarkAsLoserWhenSimpleBetNotOnFirstPrize() {
        // Arrange
        Bet bet = Bet.builder()
                .user(player)
                .betType(BetType.THOUSANDS)
                .betMode(BetMode.SIMPLE)
                .betValue("7777")
                .wagerAmount(new BigDecimal("10.00"))
                .status(BetStatus.PENDING)
                .build();

        when(betRepository.findByStatus(BetStatus.PENDING)).thenReturn(List.of(bet));

        // Saiu 7777 no 2º prêmio, mas a aposta é SIMPLE (só olha o 1º prêmio)
        CustomDrawDTO drawResult = new CustomDrawDTO("1234", "7777", "0000", "1111", "2222");

        // Act
        drawService.performCustomDraw(admin, drawResult);

        // Assert
        verify(betRepository).saveAll(betListCaptor.capture());
        Bet processedBet = betListCaptor.getValue().get(0);

        assertThat(processedBet.getStatus()).isEqualTo(BetStatus.LOSER);
        assertThat(processedBet.getPrizeWon()).isEqualByComparingTo(BigDecimal.ZERO);
        // Saldo do jogador deve permanecer intacto, pois ele perdeu
        assertThat(player.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }
}