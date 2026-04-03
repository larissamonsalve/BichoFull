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

/**
 * Teste de integração para verificar se as restrições (Constraints) do banco de dados MySQL estão funcionando.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DatabaseConstraintsTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BetRepository betRepository;

    //Testa se o banco de dados rejeita a criação de um usuário com saldo negativo.
    @Test
    @DisplayName("O banco MySQL não deve permitir User com saldo negativo (Constraint CHECK)")
    void databaseShouldRejectNegativeBalance() {
        // Tenta criar um usuário com saldo inválido (-10.00)
        User corruptedUser = User.builder()
                .name("Hacker")
                .username("hacker_teste")
                .email("hacker@teste.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("-10.00")) 
                .build();

        // Verifica se o JPA lança uma exceção de sistema ao tentar persistir o dado inválido
        assertThatThrownBy(() -> {
            userRepository.saveAndFlush(corruptedUser);
        }).isInstanceOf(org.springframework.orm.jpa.JpaSystemException.class)
          .hasMessageContaining("constraint");
    }

    //Testa se o banco de dados rejeita uma aposta com valor de aposta (wagerAmount) zero ou negativo.
    @Test
    @DisplayName("O banco MySQL não deve permitir Aposta com valor zero ou negativo")
    void databaseShouldRejectZeroOrNegativeWager() {
        // Primeiro, salva um usuário válido para associar à aposta
        User validUser = userRepository.saveAndFlush(User.builder()
                .name("Jogador")
                .username("jogador")
                .email("j@teste.com")
                .password("hash")
                .role(Role.PLAYER)
                .balance(new BigDecimal("1000.00"))
                .build());

        // Tenta criar uma aposta com valor zero
        Bet corruptedBet = Bet.builder()
                .user(validUser)
                .betType(BetType.GROUP)
                .betMode(BetMode.SIMPLE)
                .betValue("15")
                .animalGroup(15)
                .wagerAmount(BigDecimal.ZERO) 
                .build();

        // Verifica se o banco bloqueia a inserção por causa da constraint de valor positivo
        assertThatThrownBy(() -> {
            betRepository.saveAndFlush(corruptedBet);
        }).isInstanceOf(org.springframework.orm.jpa.JpaSystemException.class)
          .hasMessageContaining("constraint");
    }
}