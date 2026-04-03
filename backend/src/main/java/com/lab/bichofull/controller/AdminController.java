package com.lab.bichofull.controller;

import com.lab.bichofull.dto.BetResponseDTO;
import com.lab.bichofull.dto.CustomDrawDTO;
import com.lab.bichofull.model.Draw;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.service.DrawService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Permite que o frontend (Angular) acesse esta API
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// Garante que apenas usuários com papel de 'ADMIN' acessem este Controller
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DrawService drawService;
    private final BetRepository betRepository;

    // Endpoint para realizar um sorteio com números aleatórios
    @PostMapping("/draws/random")
    public ResponseEntity<Draw> triggerRandomDraw(@AuthenticationPrincipal User adminUser) {
        // Executa o sorteio e retorna os dados do resultado
        return ResponseEntity.ok(drawService.performDraw(adminUser));
    }

    // Endpoint para realizar um sorteio com números definidos manualmente pelo administrador
    @PostMapping("/draws/custom")
    public ResponseEntity<Draw> triggerCustomDraw(
            @Valid @RequestBody CustomDrawDTO dto,
            @AuthenticationPrincipal User adminUser) {
        // Executa o sorteio personalizado usando os dados enviados no corpo da requisição (dto)
        return ResponseEntity.ok(drawService.performCustomDraw(adminUser, dto));
    }

    // Endpoint para listar todas as apostas realizadas no sistema
    @GetMapping("/bets")
    public ResponseEntity<List<BetResponseDTO>> getAllSystemBets() {
        // Busca todas as apostas do banco, ordena pelas mais recentes e converte para DTO
        List<BetResponseDTO> response = betRepository.findAllByOrderByCreatedAtDesc().stream()
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
            )).toList();
        
        // Retorna a lista de apostas formatada
        return ResponseEntity.ok(response);
    }
}