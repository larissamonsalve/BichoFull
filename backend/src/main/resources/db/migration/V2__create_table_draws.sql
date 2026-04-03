CREATE TABLE draws (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_prize VARCHAR(4) NOT NULL,  
    second_prize VARCHAR(4) NOT NULL, 
    third_prize VARCHAR(4) NOT NULL,
    fourth_prize VARCHAR(4) NOT NULL,
    fifth_prize VARCHAR(4) NOT NULL,
    created_by BIGINT NOT NULL, 
    draw_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_draw_admin FOREIGN KEY (created_by) REFERENCES users(id)
);