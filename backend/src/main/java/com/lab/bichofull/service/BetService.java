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
}