CREATE TABLE bets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    draw_id BIGINT, 
    
    bet_type ENUM('GROUP', 'TENS', 'THOUSANDS') NOT NULL, 
    
    bet_mode ENUM('SIMPLE', 'SURROUNDED') NOT NULL,
    
    bet_value VARCHAR(4) NOT NULL,      
    animal_name VARCHAR(20),       
    wager_amount DECIMAL(10, 2) NOT NULL, 
    prize_won DECIMAL(10, 2) DEFAULT 0.00, 
    
    status ENUM('PENDING', 'WINNER', 'LOSER') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bet_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bet_draw FOREIGN KEY (draw_id) REFERENCES draws(id),
    CONSTRAINT chk_wager_positive CHECK (wager_amount > 0)
);