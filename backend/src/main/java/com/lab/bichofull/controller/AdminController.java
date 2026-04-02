package com.lab.bichofull.controller;

import com.lab.bichofull.dto.BetResponseDTO;
import com.lab.bichofull.dto.CustomDrawDTO;
import com.lab.bichofull.model.Bet;
import com.lab.bichofull.model.Draw;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.BetRepository;
import com.lab.bichofull.service.DrawService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DrawService drawService;
    private final BetRepository betRepository;

    // Utilitário interno para garantir que a rota não seja burlada
    private User requireAdmin() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Acesso negado. Requer privilégios de Administrador.");
        }
        return user;
    }

    @PostMapping("/draws/random")
    public ResponseEntity<Draw> triggerRandomDraw() {
        try {
            return ResponseEntity.ok(drawService.performDraw(requireAdmin()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/draws/custom")
    public ResponseEntity<Draw> triggerCustomDraw(@Valid @RequestBody CustomDrawDTO dto) {
        try {
            return ResponseEntity.ok(drawService.performCustomDraw(requireAdmin(), dto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

   @GetMapping("/bets")
    public ResponseEntity<List<BetResponseDTO>> getAllSystemBets() {
        requireAdmin();
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
        return ResponseEntity.ok(response);
    }
}