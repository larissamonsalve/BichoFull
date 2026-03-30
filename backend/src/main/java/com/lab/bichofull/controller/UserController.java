// main/java/com/lab/bichofull/controller/UserController.java
package com.lab.bichofull.controller;

import com.lab.bichofull.dto.UserDTO;
import com.lab.bichofull.dto.WalletStatsDTO;
import com.lab.bichofull.model.BetStatus;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor // Necessário para injetar o repository
public class UserController {

    private final BetRepository betRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(new UserDTO(user.getName(), user.getUsername(), user.getBalance()));
    }

    @GetMapping("/wallet")
    public ResponseEntity<WalletStatsDTO> getWalletStats() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = user.getId();

        // Faz as somas (Tratando null caso o utilizador não tenha apostas)
        BigDecimal won = betRepository.sumWinningsByUserId(userId);
        BigDecimal lost = betRepository.sumLossesByUserId(userId);
        BigDecimal pending = betRepository.sumPendingAmountByUserId(userId);

        won = won != null ? won : BigDecimal.ZERO;
        lost = lost != null ? lost : BigDecimal.ZERO;
        pending = pending != null ? pending : BigDecimal.ZERO;

        long pendingCount = betRepository.countByUserIdAndStatus(userId, BetStatus.PENDING);

        // Regra do lucro: Saldo atual - 1000 (Saldo inicial). Se a carteira tem 985, perdeu 15.
        BigDecimal netProfit = user.getBalance().subtract(new BigDecimal("1000.00"));

        WalletStatsDTO stats = new WalletStatsDTO(user.getBalance(), won, lost, pending, netProfit, pendingCount);
        
        return ResponseEntity.ok(stats);
    }
}