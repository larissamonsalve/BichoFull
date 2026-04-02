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

@SpringBootTest
class ConcurrencyIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private BetService betService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Bloqueio de Concorrência: Deve impedir apostas simultâneas que excedam o saldo")
    void shouldPreventConcurrentBetsWithOptimisticLocking() throws InterruptedException {
        // 1. Arrange
        User player = userRepository.saveAndFlush(User.builder()
                .name("Flash")
                .username("fast_clicker_v2")
                .email("flash_v2@teste.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("50.00"))
                .build());

        BetDTO betDTO = new BetDTO(BetType.GROUP, BetMode.SIMPLE, "10", new BigDecimal("50.00"));

        int numberOfThreads = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1); 
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads); 

        AtomicInteger successfulBets = new AtomicInteger(0);
        AtomicInteger lockingFailures = new AtomicInteger(0);

        // 2. Act
        for (int i = 0; i < numberOfThreads; i++) {
            executorService.execute(() -> {
                try {
                    User threadUser = userRepository.findById(player.getId()).orElseThrow();
                    
                    latch.await(); 
                    
                    betService.placeBet(betDTO, threadUser);
                    
                    successfulBets.incrementAndGet();
                } catch (ConcurrencyFailureException e) {
                    lockingFailures.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown(); 
        doneLatch.await(); 
        executorService.shutdown();

        // 3. Assert
        assertThat(successfulBets.get()).isEqualTo(1); // Só uma transação sobrevive
        assertThat(lockingFailures.get()).isEqualTo(1); // A outra morre batendo no escudo do banco

        User finalUser = userRepository.findById(player.getId()).orElseThrow();
        assertThat(finalUser.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        
    }
}