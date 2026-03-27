CREATE TABLE bets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    draw_id BIGINT, -- Vinculado após o sorteio ser processado
    
    -- Tipo: GROUP (1 a 25), TENS (00 a 99), THOUSANDS (0000 a 9999) [cite: 21, 22, 23]
    bet_type ENUM('GROUP', 'TENS', 'THOUSANDS') NOT NULL, 
    
    -- Modo: SIMPLE (1º prêmio) ou SURROUNDED (1º ao 5º) [cite: 108, 112]
    bet_mode ENUM('SIMPLE', 'SURROUNDED') NOT NULL,
    
    bet_value VARCHAR(4) NOT NULL,        -- O número ou grupo escolhido [cite: 127]
    wager_amount DECIMAL(10, 2) NOT NULL, -- Valor apostado (mínimo R$ 0,01) [cite: 115]
    
    -- Resultado do prêmio: Calculado pelo sistema após o sorteio [cite: 10, 111, 118]
    prize_won DECIMAL(10, 2) DEFAULT 0.00, 
    
    status ENUM('PENDING', 'WINNER', 'LOSER') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bet_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bet_draw FOREIGN KEY (draw_id) REFERENCES draws(id),
    -- RN: O saldo nunca pode ser negativo, então a aposta deve ser validada no Java [cite: 37, 128]
    CONSTRAINT chk_wager_positive CHECK (wager_amount > 0)
);