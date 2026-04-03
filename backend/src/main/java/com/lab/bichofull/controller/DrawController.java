package com.lab.bichofull.controller;

import com.lab.bichofull.dto.DrawDTO;
import com.lab.bichofull.model.Draw;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.DrawRepository;
import com.lab.bichofull.service.DrawService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Permite requisições do frontend Angular
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/draws") // Define a rota base para sorteios
@RequiredArgsConstructor // Injeta dependências via construtor
public class DrawController {

    private final DrawService drawService;
    private final DrawRepository drawRepository;

    //Endpoint para listar todos os sorteios realizados
    @GetMapping
    public ResponseEntity<List<DrawDTO>> getAllDraws() {
        // Busca todos os sorteios ordenados pela data mais recente e converte para DTO
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

    //Endpoint para um administrador disparar um sorteio manual.
    @PostMapping("/manual")
    @PreAuthorize("hasRole('ADMIN')") // Restringe o acesso apenas a usuários administradores
    public ResponseEntity<Draw> triggerManualDraw(@AuthenticationPrincipal User authenticatedUser) {
        // Realiza o sorteio e retorna o novo objeto Draw criado
        Draw newDraw = drawService.performDraw(authenticatedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(newDraw);
    }
}