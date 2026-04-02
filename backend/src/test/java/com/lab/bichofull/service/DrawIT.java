package com.lab.bichofull.service;

import com.lab.bichofull.BaseIntegrationTest;
import com.lab.bichofull.dto.CustomDrawDTO;
import com.lab.bichofull.model.*;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.repository.DrawRepository;
import com.lab.bichofull.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
// O @Transactional em testes de integração dá rollback ao final, mantendo o banco do Docker limpo para o próximo teste
@Transactional 
class DrawIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private DrawService drawService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BetRepository betRepository;

    @Autowired
    private DrawRepository drawRepository;

    @Test
    @DisplayName("Teste Fim-a-Fim: Deve realizar sorteio transacional, pagar aposta e salvar no MySQL")
    void fullTransactionalDrawExecution() {
        // 1. Arrange: Insere registros REAIS no banco de dados (MySQL via Docker)
        User admin = userRepository.save(User.builder()
                .name("O Dono da Banca")
                .username("bicheiro_admin")
                .email("admin_draw@bichofull.com")
                .password("hash")
                .role(Role.ADMIN)
                .balance(BigDecimal.ZERO)
                .build());

        User player = userRepository.save(User.builder()
                .name("Apostador de Elite")
                .username("apostador_pro")
                .email("player_draw@bichofull.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("500.00")) // Saldo inicial na conta
                .build());

        Bet pendingBet = betRepository.save(Bet.builder()
                .user(player)
                .betType(BetType.THOUSANDS)
                .betMode(BetMode.SIMPLE)
                .betValue("1313") // Apostou na milhar 1313 na cabeça
                .animalGroup(4)   // Borboleta
                .wagerAmount(new BigDecimal("10.00"))
                .status(BetStatus.PENDING)
                .build());

        // 2. Act: O Admin realiza um sorteio manipulado onde o 1º prêmio dá a milhar exata apostada
        CustomDrawDTO drawResult = new CustomDrawDTO("1313", "0000", "1111", "2222", "3333");
        Draw executedDraw = drawService.performCustomDraw(admin, drawResult);

        // 3. Assert: Vamos buscar diretamente do banco para garantir que o @Transactional funcionou
        
        // Verifica se o Sorteio foi salvo
        assertThat(drawRepository.findById(executedDraw.getId())).isPresent();

        // Verifica a Aposta
        Bet betFromDb = betRepository.findById(pendingBet.getId()).orElseThrow();
        assertThat(betFromDb.getStatus()).isEqualTo(BetStatus.WINNER);
        assertThat(betFromDb.getDraw().getId()).isEqualTo(executedDraw.getId()); // Sorteio vinculado à aposta
        // Ganho de Milhar Simples: 10 * 4000 = 40.000
        assertThat(betFromDb.getPrizeWon()).isEqualByComparingTo(new BigDecimal("40000.00"));

        // Verifica o Saldo atualizado do Jogador transacionalmente no Banco (500 + 40000)
        User playerFromDb = userRepository.findById(player.getId()).orElseThrow();
        assertThat(playerFromDb.getBalance()).isEqualByComparingTo(new BigDecimal("40500.00"));
    }
}