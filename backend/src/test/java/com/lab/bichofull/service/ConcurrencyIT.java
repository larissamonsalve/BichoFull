package com.lab.bichofull.service;

import com.lab.bichofull.BaseIntegrationTest;
import com.lab.bichofull.dto.BetDTO;
import com.lab.bichofull.model.BetMode;
import com.lab.bichofull.model.BetType;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.ConcurrencyFailureException; 

import java.math.BigDecimal;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste de integração para validar o controle de concorrência (Optimistic Locking).
 * Garante que o sistema não permita que duas apostas simultâneas gastem o mesmo saldo.
 */
@SpringBootTest
class ConcurrencyIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private BetService betService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Bloqueio de Concorrência: Deve impedir apostas simultâneas que excedam o saldo")
    void shouldPreventConcurrentBetsWithOptimisticLocking() throws InterruptedException {
        // 1. Arrange: Cria um usuário com saldo de 50.00
        User player = userRepository.saveAndFlush(User.builder()
                .name("Flash")
                .username("fast_clicker_v2")
                .email("flash_v2@teste.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("50.00"))
                .build());

        // Prepara uma aposta que consome todo o saldo (50.00)
        BetDTO betDTO = new BetDTO(BetType.GROUP, BetMode.SIMPLE, "10", new BigDecimal("50.00"));

        int numberOfThreads = 2; // Simula dois acessos ao mesmo tempo
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1); // Controla a largada simultânea
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads); // Controla a espera pelo fim

        AtomicInteger successfulBets = new AtomicInteger(0);
        AtomicInteger lockingFailures = new AtomicInteger(0);

        // 2. Act: Dispara duas threads tentando realizar a mesma aposta ao mesmo tempo
        for (int i = 0; i < numberOfThreads; i++) {
            executorService.execute(() -> {
                try {
                    // Cada thread busca sua própria instância do usuário no banco
                    User threadUser = userRepository.findById(player.getId()).orElseThrow();
                    
                    latch.await(); // Aguarda o sinal de largada para correrem juntas
                    
                    // Tenta realizar a aposta
                    betService.placeBet(betDTO, threadUser);
                    
                    successfulBets.incrementAndGet();
                } catch (ConcurrencyFailureException e) {
                    // Captura o erro de trava otimista do Hibernate (@Version)
                    lockingFailures.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown(); // Dá a largada para as threads
        doneLatch.await(); // Espera ambas terminarem
        executorService.shutdown();

        // 3. Assert: Valida se apenas uma aposta teve sucesso e a outra foi bloqueada
        assertThat(successfulBets.get()).isEqualTo(1); // Apenas uma transação deve ser confirmada
        assertThat(lockingFailures.get()).isEqualTo(1); // A outra deve falhar por conflito de versão (Optimistic Lock)

        // Verifica se o saldo final é zero (apenas um débito de 50 ocorreu)
        User finalUser = userRepository.findById(player.getId()).orElseThrow();
        assertThat(finalUser.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}