CREATE TABLE draws (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_prize VARCHAR(4) NOT NULL,  -- Ex: '1234'
    second_prize VARCHAR(4) NOT NULL, -- Ex: '5678'
    third_prize VARCHAR(4) NOT NULL,
    fourth_prize VARCHAR(4) NOT NULL,
    fifth_prize VARCHAR(4) NOT NULL,
    created_by BIGINT NOT NULL,       -- Admin que iniciou o sorteio [cite: 74, 75]
    draw_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_draw_admin FOREIGN KEY (created_by) REFERENCES users(id)
);