package com.lab.bichofull.repository;

import com.lab.bichofull.BaseIntegrationTest;
import com.lab.bichofull.model.Bet;
import com.lab.bichofull.model.BetMode;
import com.lab.bichofull.model.BetType;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DatabaseConstraintsTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BetRepository betRepository;

    @Test
    @DisplayName("O banco MySQL não deve permitir User com saldo negativo (Constraint CHECK)")
    void databaseShouldRejectNegativeBalance() {
        User corruptedUser = User.builder()
                .name("Hacker")
                .username("hacker_teste")
                .email("hacker@teste.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("-10.00")) 
                .build();

        assertThatThrownBy(() -> {
            userRepository.saveAndFlush(corruptedUser);
        }).isInstanceOf(org.springframework.orm.jpa.JpaSystemException.class)
          .hasMessageContaining("constraint");
    }

    @Test
    @DisplayName("O banco MySQL não deve permitir Aposta com valor zero ou negativo")
    void databaseShouldRejectZeroOrNegativeWager() {
        User validUser = userRepository.saveAndFlush(User.builder()
                .name("Jogador")
                .username("jogador")
                .email("j@teste.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("1000.00"))
                .build());

        Bet corruptedBet = Bet.builder()
                .user(validUser)
                .betType(BetType.GROUP)
                .betMode(BetMode.SIMPLE)
                .betValue("15")
                .animalGroup(15)
                .wagerAmount(BigDecimal.ZERO) 
                .build();

        assertThatThrownBy(() -> {
            betRepository.saveAndFlush(corruptedBet);
        }).isInstanceOf(org.springframework.orm.jpa.JpaSystemException.class)
          .hasMessageContaining("constraint");
    }
}