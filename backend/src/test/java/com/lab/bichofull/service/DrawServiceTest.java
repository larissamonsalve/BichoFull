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

// Configura o Mockito para testes unitários isolados
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

    // Prepara o cenário básico antes de cada teste
    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).username("admin").role(Role.ADMIN).build();
        player = User.builder().id(2L).username("jogador").balance(new BigDecimal("1000.00")).build();
        
        // Simula o salvamento do sorteio retornando o próprio objeto
        when(drawRepository.save(any(Draw.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    //Testa se uma aposta SIMPLES no GRUPO (Vaca) ganha 18x o valor quando sai no 1º prêmio.
    @Test
    @DisplayName("Deve calcular corretamente aposta SIMPLES no GRUPO (18x) - Vaca (00)")
    void shouldCalculateSimpleGroupBetWinner() {
        // Arrange: Aposta de 10 reais no grupo 25 (Vaca)
        Bet bet = Bet.builder()
                .user(player)
                .betType(BetType.GROUP)
                .betMode(BetMode.SIMPLE)
                .animalGroup(25) 
                .wagerAmount(new BigDecimal("10.00"))
                .status(BetStatus.PENDING)
                .build();

        when(betRepository.findByStatus(BetStatus.PENDING)).thenReturn(List.of(bet));

        // Define sorteio onde o 1º prêmio termina em 00 (Vaca)
        CustomDrawDTO drawResult = new CustomDrawDTO("5600", "1234", "1234", "1234", "1234");

        // Act: Processa o sorteio
        drawService.performCustomDraw(admin, drawResult);

        // Assert: Verifica se a aposta virou WINNER e pagou 180 (10 * 18)
        verify(betRepository).saveAll(betListCaptor.capture());
        Bet processedBet = betListCaptor.getValue().get(0);

        assertThat(processedBet.getStatus()).isEqualTo(BetStatus.WINNER);
        assertThat(processedBet.getPrizeWon()).isEqualByComparingTo(new BigDecimal("180.00"));
        assertThat(player.getBalance()).isEqualByComparingTo(new BigDecimal("1180.00"));
    }

    //Testa se uma aposta CERCADA na DEZENA divide o valor por 5 e multiplica pelos acertos (3 vezes neste caso).
    @Test
    @DisplayName("Deve calcular corretamente aposta CERCADA na DEZENA (60x) com 3 acertos")
    void shouldCalculateSurroundedTensBetWithMultipleMatches() {
        // Arrange: Aposta cercada de 50 reais (10 reais por prêmio) na dezena 42
        Bet bet = Bet.builder()
                .user(player)
                .betType(BetType.TENS)
                .betMode(BetMode.SURROUNDED)
                .betValue("42")
                .wagerAmount(new BigDecimal("50.00"))
                .status(BetStatus.PENDING)
                .build();

        when(betRepository.findByStatus(BetStatus.PENDING)).thenReturn(List.of(bet));

        // Sorteio onde a dezena 42 sai em 3 dos 5 prêmios
        CustomDrawDTO drawResult = new CustomDrawDTO("1111", "9942", "8842", "2222", "7742");

        // Act: Executa o sorteio
        drawService.performCustomDraw(admin, drawResult);

        // Assert: Verifica ganho (10 base * 60 multiplicador * 3 acertos = 1800)
        verify(betRepository).saveAll(betListCaptor.capture());
        Bet processedBet = betListCaptor.getValue().get(0);

        assertThat(processedBet.getStatus()).isEqualTo(BetStatus.WINNER);
        assertThat(processedBet.getPrizeWon()).isEqualByComparingTo(new BigDecimal("1800.00"));
        assertThat(player.getBalance()).isEqualByComparingTo(new BigDecimal("2800.00"));
    }

    //Testa se o sistema marca como PERDEDORA uma aposta SIMPLES quando o número sai em outros prêmios, exceto no 1º.

    @Test
    @DisplayName("Deve processar como PERDEDORA aposta na MILHAR que não saiu na cabeça")
    void shouldMarkAsLoserWhenSimpleBetNotOnFirstPrize() {
        // Arrange: Aposta simples na milhar 7777
        Bet bet = Bet.builder()
                .user(player)
                .betType(BetType.THOUSANDS)
                .betMode(BetMode.SIMPLE)
                .betValue("7777")
                .wagerAmount(new BigDecimal("10.00"))
                .status(BetStatus.PENDING)
                .build();

        when(betRepository.findByStatus(BetStatus.PENDING)).thenReturn(List.of(bet));

        // Sorteio onde 7777 sai no 2º prêmio, mas a aposta é apenas para o 1º
        CustomDrawDTO drawResult = new CustomDrawDTO("1234", "7777", "0000", "1111", "2222");

        // Act: Processa o sorteio
        drawService.performCustomDraw(admin, drawResult);

        // Assert: Verifica se a aposta foi marcada como LOSER
        verify(betRepository).saveAll(betListCaptor.capture());
        Bet processedBet = betListCaptor.getValue().get(0);

        assertThat(processedBet.getStatus()).isEqualTo(BetStatus.LOSER);
        assertThat(processedBet.getPrizeWon()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(player.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }
}