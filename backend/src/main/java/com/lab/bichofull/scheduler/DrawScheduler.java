package com.lab.bichofull.scheduler;

import com.lab.bichofull.model.Role;
import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;
import com.lab.bichofull.service.DrawService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DrawScheduler {

    private final DrawService drawService;
    private final UserRepository userRepository;

    // A sintaxe Cron abaixo dispara às: 11h, 14h, 16h, 18h e 21h todos os dias.
    @Scheduled(cron = "0 0 11,14,16,18,21 * * *", zone = "America/Manaus")
    public void executeAutomaticDraw() {
        log.info("Iniciando sorteio automático agendado...");
        
        // Busca um administrador no sistema para vincular ao sorteio
        User systemAdmin = userRepository.findFirstByRole(Role.ADMIN)
                .orElseThrow(() -> new IllegalStateException("Nenhum Administrador encontrado no sistema para registrar o sorteio."));

        drawService.performDraw(systemAdmin);
    }
}