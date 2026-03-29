CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE, -- Para Admins [cite: 5, 300]   
    email VARCHAR(100) UNIQUE,
    -- VARCHAR(255) é o padrão para armazenar hashes (BCrypt/Argon2) 
    password VARCHAR(255) NOT NULL, 
    role VARCHAR(20) NOT NULL,
    -- RN: Saldo inicial de 1000 e nunca negativo [cite: 16, 37]
    balance DECIMAL(10, 2) NOT NULL DEFAULT 1000.00 CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);