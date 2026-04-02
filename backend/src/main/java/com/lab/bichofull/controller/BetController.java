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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200") // Permite chamadas do Angular
@RestController
@RequestMapping("/api/bets")
@RequiredArgsConstructor
public class BetController {

    private final BetService betService;
    private final BetRepository betRepository;

    @PostMapping
    public ResponseEntity<String> createBet(@Valid @RequestBody BetDTO dto) {
        try {
            // Como o SecurityFilter já validou o token e carregou o User no contexto,
            // podemos extraí-lo diretamente de forma segura.
            User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            
            betService.placeBet(dto, authenticatedUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body("Aposta realizada com sucesso!");
        } catch (IllegalArgumentException e) {
            // Captura as exceções de "Saldo insuficiente" ou "Valor zero" lançadas pela entidade User
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocorreu um erro ao processar a aposta.");
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Page<BetResponseDTO>> getBetHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        
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

    @GetMapping("/history/summary")
    public ResponseEntity<BetHistorySummaryDTO> getHistorySummary() {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(betService.getUserHistorySummary(authenticatedUser.getId()));
    }
}