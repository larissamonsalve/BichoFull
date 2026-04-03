package com.lab.bichofull.controller;

import com.lab.bichofull.dto.BetDTO;
import com.lab.bichofull.dto.BetResponseDTO;
import com.lab.bichofull.dto.BetHistorySummaryDTO;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.service.BetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsável pelas operações relacionadas às apostas dos usuários.
 */
@CrossOrigin(origins = "http://localhost:4200") // Permite o acesso do frontend Angular
@RestController
@RequestMapping("/api/bets") // Define a rota base para apostas
@RequiredArgsConstructor // Injeta dependências automaticamente via construtor
public class BetController {

    private final BetService betService;
    private final BetRepository betRepository;

    //Endpoint para criar uma nova aposta.
    @PostMapping
    public ResponseEntity<String> createBet(
            @Valid @RequestBody BetDTO dto, 
            @AuthenticationPrincipal User authenticatedUser) {
        
        // Chama o serviço para processar a aposta (valida saldo e salva no banco)
        betService.placeBet(dto, authenticatedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("Aposta realizada com sucesso!");
    }

    //Endpoint para obter o histórico de apostas paginado do usuário logado.
    @GetMapping("/history")
    public ResponseEntity<Page<BetResponseDTO>> getBetHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User authenticatedUser) {
        
        // Configura as opções de paginação
        Pageable pageable = PageRequest.of(page, size);
        
        // Busca as apostas do usuário e converte para DTO de resposta
        Page<BetResponseDTO> historyPage = betRepository.findByUserIdOrderByCreatedAtDesc(authenticatedUser.getId(), pageable)
            .map(bet -> new BetResponseDTO(
                bet.getId(),
                bet.getUser().getUsername(),
                bet.getUser().getEmail(),
                bet.getBetType(),
                bet.getBetMode(),
                bet.getBetValue(),
                bet.getWagerAmount(),
                bet.getPrizeWon(),
                bet.getStatus(),
                bet.getCreatedAt()
            ));
        
        return ResponseEntity.ok(historyPage);
    }

    //Endpoint para obter um resumo estatístico (total de apostas, ganhos, perdas) do usuário.
    @GetMapping("/history/summary")
    public ResponseEntity<BetHistorySummaryDTO> getHistorySummary(@AuthenticationPrincipal User authenticatedUser) {
        // Retorna o resumo consolidado calculado pelo serviço
        return ResponseEntity.ok(betService.getUserHistorySummary(authenticatedUser.getId()));
    }
}