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

// Utiliza a extensão do Mockito para testes unitários
@ExtendWith(MockitoExtension.class)
class BetServiceTest {

    @Mock
    private BetRepository betRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BetService betService; // Injeta os mocks acima no serviço

    @Captor
    private ArgumentCaptor<Bet> betCaptor; // Captura o objeto Bet que será enviado ao repositório

    private User user;

    // Configuração inicial executada antes de cada teste
    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("jogador_teste")
                .balance(new BigDecimal("500.00"))
                .build();
    }

    /**
     * Testa o fluxo principal de criação de aposta com sucesso.
     * Valida o débito no saldo e o cálculo correto do grupo do animal.
     */
    @Test
    @DisplayName("Deve registrar aposta com sucesso, deduzir saldo e calcular o grupo do animal (Milhar)")
    void shouldPlaceBetSuccessfully() {
        // Arrange: Prepara os dados da aposta (Milhar 1242)
        BetDTO dto = new BetDTO(BetType.THOUSANDS, BetMode.SIMPLE, "1242", new BigDecimal("100.00"));

        // Act: Executa a ação de apostar
        betService.placeBet(dto, user);

        // Assert: Verifica se o usuário e a aposta foram salvos corretamente
        verify(userRepository, times(1)).save(user);
        verify(betRepository, times(1)).save(betCaptor.capture());

        Bet savedBet = betCaptor.getValue();
        
        // Valida se o saldo foi para 400 e se o grupo calculado foi o 11 (Cavalo)
        assertThat(user.getBalance()).isEqualByComparingTo(new BigDecimal("400.00"));
        assertThat(savedBet.getUser()).isEqualTo(user);
        assertThat(savedBet.getBetType()).isEqualTo(BetType.THOUSANDS);
        assertThat(savedBet.getBetValue()).isEqualTo("1242");
        assertThat(savedBet.getAnimalGroup()).isEqualTo(11);
    }

    //Testa a regra especial onde a dezena "00" deve pertencer ao grupo 25 (Vaca).
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
        
        // Valida a regra de negócio específica do grupo 25
        assertThat(savedBet.getAnimalGroup()).isEqualTo(25);
    }

    //Testa se o sistema impede a aposta caso o usuário tente apostar mais do que possui.
    @Test
    @DisplayName("Deve falhar e não salvar aposta se o usuário não tiver saldo (Fail-Fast)")
    void shouldNotPlaceBetWhenInsufficientBalance() {
        // Arrange: Aposta de 1000 para um saldo de 500
        BetDTO dto = new BetDTO(BetType.GROUP, BetMode.SIMPLE, "15", new BigDecimal("1000.00"));

        // Act & Assert: Espera que uma exceção seja lançada com a mensagem correta
        assertThatThrownBy(() -> betService.placeBet(dto, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Saldo insuficiente.");

        // Garante que nenhum dado foi salvo no banco após o erro
        verify(userRepository, never()).save(any());
        verify(betRepository, never()).save(any());
    }
}