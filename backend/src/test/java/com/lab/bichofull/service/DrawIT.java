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
// O @Transactional garante que as alterações no banco sejam revertidas após o teste
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

    /**
     * Teste que valida o fluxo completo: criação de sorteio, processamento de ganhadores e atualização de saldos.
     */
    @Test
    @DisplayName("Teste Fim-a-Fim: Deve realizar sorteio transacional, pagar aposta e salvar no MySQL")
    void fullTransactionalDrawExecution() {
        // 1. Arrange: Insere dados iniciais (Admin, Jogador e uma Aposta Pendente) no banco de dados
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
                .balance(new BigDecimal("500.00"))
                .build());

        // Cria uma aposta na milhar "1313" que será premiada neste teste
        Bet pendingBet = betRepository.save(Bet.builder()
                .user(player)
                .betType(BetType.THOUSANDS)
                .betMode(BetMode.SIMPLE)
                .betValue("1313")
                .animalGroup(4)
                .wagerAmount(new BigDecimal("10.00"))
                .status(BetStatus.PENDING)
                .build());

        // 2. Act: O Admin realiza um sorteio customizado onde o primeiro prêmio coincide com a aposta
        CustomDrawDTO drawResult = new CustomDrawDTO("1313", "0000", "1111", "2222", "3333");
        Draw executedDraw = drawService.performCustomDraw(admin, drawResult);

        // 3. Assert: Valida se as informações foram persistidas e processadas corretamente no banco
        
        // Verifica se o registro do sorteio foi salvo
        assertThat(drawRepository.findById(executedDraw.getId())).isPresent();

        // Verifica se a aposta mudou para status WINNER e vinculou o sorteio
        Bet betFromDb = betRepository.findById(pendingBet.getId()).orElseThrow();
        assertThat(betFromDb.getStatus()).isEqualTo(BetStatus.WINNER);
        assertThat(betFromDb.getDraw().getId()).isEqualTo(executedDraw.getId());
        
        // Valida o cálculo do prêmio (Milhar paga 4000 vezes o valor apostado)
        assertThat(betFromDb.getPrizeWon()).isEqualByComparingTo(new BigDecimal("40000.00"));

        // Verifica se o saldo do jogador foi atualizado com o prêmio (500 iniciais + 40000 ganhos)
        User playerFromDb = userRepository.findById(player.getId()).orElseThrow();
        assertThat(playerFromDb.getBalance()).isEqualByComparingTo(new BigDecimal("40500.00"));
    }
}