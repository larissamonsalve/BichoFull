package com.lab.bichofull.controller;

import com.lab.bichofull.dto.DrawDTO;
import com.lab.bichofull.model.Draw;
import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.DrawRepository;
import com.lab.bichofull.service.DrawService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/draws")
@RequiredArgsConstructor
public class DrawController {

    private final DrawService drawService;
    private final DrawRepository drawRepository;

    @GetMapping
    public ResponseEntity<List<DrawDTO>> getAllDraws() {
        List<DrawDTO> draws = drawRepository.findAllByOrderByDrawDateDesc().stream()
            .map(draw -> new DrawDTO(
                draw.getId(),
                draw.getFirstPrize(),
                draw.getSecondPrize(),
                draw.getThirdPrize(),
                draw.getFourthPrize(),
                draw.getFifthPrize(),
                draw.getDrawDate()
            )).toList();
            
        return ResponseEntity.ok(draws);
    }

    @PostMapping("/manual")
    public ResponseEntity<?> triggerManualDraw() {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (authenticatedUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Apenas administradores podem realizar sorteios.");
        }

        try {
            Draw newDraw = drawService.performDraw(authenticatedUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(newDraw);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao processar o sorteio.");
        }
    }
}