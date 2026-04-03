package com.lab.bichofull.controller;

import com.lab.bichofull.dto.UserDTO;
import com.lab.bichofull.dto.WalletStatsDTO;
import com.lab.bichofull.model.BetStatus;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users") // Define a rota base para informações do usuário
@RequiredArgsConstructor // Injeta dependências automaticamente via construtor
public class UserController {

    private final BetRepository betRepository;

    //Endpoint para obter os dados básicos do perfil do usuário logado.
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal User user) {
        // Retorna o DTO com nome, username e saldo atual do usuário autenticado
        return ResponseEntity.ok(new UserDTO(user.getName(), user.getUsername(), user.getBalance()));
    }

    //Endpoint para obter estatísticas detalhadas da carteira do usuário.
    @GetMapping("/wallet")
    public ResponseEntity<WalletStatsDTO> getWalletStats(@AuthenticationPrincipal User user) {
        Long userId = user.getId();

        // Busca somatórios de ganhos, perdas e valores pendentes no banco de dados
        BigDecimal won = betRepository.sumWinningsByUserId(userId);
        BigDecimal lost = betRepository.sumLossesByUserId(userId);
        BigDecimal pending = betRepository.sumPendingAmountByUserId(userId);

        // Garante que valores nulos sejam tratados como zero
        won = won != null ? won : BigDecimal.ZERO;
        lost = lost != null ? lost : BigDecimal.ZERO;
        pending = pending != null ? pending : BigDecimal.ZERO;

        // Conta a quantidade de apostas que ainda aguardam sorteio
        long pendingCount = betRepository.countByUserIdAndStatus(userId, BetStatus.PENDING);

        // Calcula o lucro líquido baseado no saldo inicial de 1000.00
        BigDecimal netProfit = user.getBalance().subtract(new BigDecimal("1000.00"));

        // Monta o objeto de resposta com todas as estatísticas calculadas
        WalletStatsDTO stats = new WalletStatsDTO(user.getBalance(), won, lost, pending, netProfit, pendingCount);
        
        return ResponseEntity.ok(stats);
    }
}