package com.lab.bichofull.service;

import com.lab.bichofull.model.*;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.repository.DrawRepository;
import com.lab.bichofull.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DrawService {

    private final DrawRepository drawRepository;
    private final BetRepository betRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    @Transactional
    public Draw performDraw(User adminUser) {
        log.info("Iniciando sorteio...");

        // 1. Sorteia os 5 prêmios (Globos de 0000 a 9999)
        Draw draw = Draw.builder()
                .firstPrize(generatePrize())
                .secondPrize(generatePrize())
                .thirdPrize(generatePrize())
                .fourthPrize(generatePrize())
                .fifthPrize(generatePrize())
                .createdBy(adminUser)
                .build();

        draw = drawRepository.save(draw);

        // 2. Processa todas as apostas pendentes
        processPendingBets(draw);

        return draw;
    }

    private String generatePrize() {
        return String.format("%04d", random.nextInt(10000));
    }

    // Sorteio manual usando a mesma logica de distribuição de premios
    @Transactional
    public Draw performCustomDraw(User adminUser, com.lab.bichofull.dto.CustomDrawDTO dto) {
        log.info("Iniciando sorteio customizado (Manual) pelo Admin: {}", adminUser.getUsername());

        Draw draw = Draw.builder()
                .firstPrize(dto.firstPrize())
                .secondPrize(dto.secondPrize())
                .thirdPrize(dto.thirdPrize())
                .fourthPrize(dto.fourthPrize())
                .fifthPrize(dto.fifthPrize())
                .createdBy(adminUser)
                .build();

        draw = drawRepository.save(draw);
        
        // Reutiliza o método existente para calcular ganhadores e pagar prêmios
        processPendingBets(draw);

        return draw;
    }

    private void processPendingBets(Draw draw) {
        List<Bet> pendingBets = betRepository.findByStatus(BetStatus.PENDING);
        Map<User, BigDecimal> userBalanceUpdates = new HashMap<>();
        List<String> prizes = Arrays.asList(
                draw.getFirstPrize(), draw.getSecondPrize(), draw.getThirdPrize(), 
                draw.getFourthPrize(), draw.getFifthPrize()
        );

        for (Bet bet : pendingBets) {
            bet.setDraw(draw);
            int matchCount = 0;

            if (bet.getBetMode() == BetMode.SIMPLE) {
                // Aposta na Cabeça: Só importa o 1º prêmio
                if (isMatch(bet, draw.getFirstPrize())) {
                    matchCount = 1;
                }
            } else if (bet.getBetMode() == BetMode.SURROUNDED) {
                // Aposta Cercada: Conta ocorrências nos 5 prêmios
                for (String prize : prizes) {
                    if (isMatch(bet, prize)) {
                        matchCount++;
                    }
                }
            }

            if (matchCount > 0) {
                bet.setStatus(BetStatus.WINNER);
                BigDecimal winnings = calculateWinnings(bet, matchCount);
                bet.setPrizeWon(winnings);

                // Agrupa os ganhos por usuário para atualizar o saldo apenas uma vez
                userBalanceUpdates.merge(bet.getUser(), winnings, BigDecimal::add);
            } else {
                bet.setStatus(BetStatus.LOSER);
                bet.setPrizeWon(BigDecimal.ZERO);
            }
        }

        betRepository.saveAll(pendingBets);

        // Atualiza os saldos dos usuários ganhadores
        for (Map.Entry<User, BigDecimal> entry : userBalanceUpdates.entrySet()) {
            User user = entry.getKey();
            user.setBalance(user.getBalance().add(entry.getValue()));
            userRepository.save(user);
        }
        
        log.info("Sorteio finalizado. {} apostas processadas.", pendingBets.size());
    }

    private boolean isMatch(Bet bet, String prize) {
        return switch (bet.getBetType()) {
            case THOUSANDS -> prize.equals(bet.getBetValue());
            case TENS -> prize.endsWith(bet.getBetValue()); // Pega os 2 últimos dígitos
            case GROUP -> getAnimalGroupFromPrize(prize).equals(bet.getAnimalGroup());
        };
    }

    private BigDecimal calculateWinnings(Bet bet, int matchCount) {
        // Multiplicadores baseados na RN
        BigDecimal multiplier = switch (bet.getBetType()) {
            case GROUP -> new BigDecimal("18");
            case TENS -> new BigDecimal("60");
            case THOUSANDS -> new BigDecimal("4000");
        };

        BigDecimal baseWager = bet.getWagerAmount();

        if (bet.getBetMode() == BetMode.SURROUNDED) {
            // Cercada: O valor da aposta é fatiado por 5
            baseWager = baseWager.divide(new BigDecimal("5"), 2, RoundingMode.HALF_UP);
        }

        // Multiplica o valor (fatiado ou cheio) pelo multiplicador e pela qtd de vezes que o bicho/número saiu
        return baseWager.multiply(multiplier).multiply(new BigDecimal(matchCount));
    }

    private Integer getAnimalGroupFromPrize(String prize) {
        String lastTwoDigits = prize.substring(prize.length() - 2);
        int ten = Integer.parseInt(lastTwoDigits);
        
        if (ten == 0) return 25; // 00 é a Vaca
        return (int) Math.ceil(ten / 4.0); // Matemática de 4 em 4
    }
}