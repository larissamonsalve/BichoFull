package com.lab.bichofull.service;

import com.lab.bichofull.dto.BetDTO;
import com.lab.bichofull.model.Bet;
import com.lab.bichofull.model.BetType;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lab.bichofull.dto.BetHistorySummaryDTO;
import com.lab.bichofull.model.BetStatus;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BetService {
    
    private final BetRepository betRepository;
    private final UserRepository userRepository;

    @Transactional
    public void placeBet(BetDTO dto, User user) {
        user.debitBalance(dto.wagerAmount());
        
        userRepository.save(user);

        Integer animalGroup = calculateAnimalGroup(dto.betType(), dto.betValue());

        Bet bet = Bet.builder()
                .user(user)
                .betType(dto.betType())
                .betMode(dto.betMode())    
                .animalGroup(animalGroup)
                .betValue(dto.betValue())
                .wagerAmount(dto.wagerAmount())
                .build();
        
        betRepository.save(bet);
    }

    private Integer calculateAnimalGroup(BetType type, String value) {
        if (type == BetType.GROUP) {
            return Integer.parseInt(value);
        }
        
        // Pega as duas últimas casas para Dezenas (ex: "42") ou Milhares (ex: "1242" -> "42")
        String lastTwoDigits = value.substring(value.length() - 2);
        int ten = Integer.parseInt(lastTwoDigits);
        
        // Regra Especial: O número 00 pertence à Vaca (Grupo 25)
        if (ten == 0) {
            return 25;
        }

        // Matemática do bicho: Divide a dezena por 4 e arredonda para cima
        return (int) Math.ceil(ten / 4.0);
    }

    //historico
    public BetHistorySummaryDTO getUserHistorySummary(Long userId) {
        long totalBets = betRepository.countByUserId(userId);
        long wonBets = betRepository.countByUserIdAndStatus(userId, BetStatus.WINNER);
        
        double winRate = 0.0;
        if (totalBets > 0) {
            winRate = ((double) wonBets / totalBets) * 100.0;
        }

        BigDecimal totalWon = betRepository.sumWinningsByUserId(userId);
        BigDecimal totalLost = betRepository.sumLossesByUserId(userId);

        return new BetHistorySummaryDTO(
            totalBets,
            Math.round(winRate * 100.0) / 100.0, // Arredonda para 2 casas decimais
            totalWon != null ? totalWon : BigDecimal.ZERO,
            totalLost != null ? totalLost : BigDecimal.ZERO
        );
    }
}