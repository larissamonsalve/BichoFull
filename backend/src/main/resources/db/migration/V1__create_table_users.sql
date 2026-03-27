CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    -- Username único para Admins. Pode ser nulo para Players (que usam email).
    username VARCHAR(50) UNIQUE, 
    email VARCHAR(100) UNIQUE,
    -- VARCHAR(255) é o padrão para armazenar hashes (BCrypt/Argon2) 
    password VARCHAR(255) NOT NULL, 
    role ENUM('PLAYER', 'ADMIN') NOT NULL,
    -- RN: Saldo inicial de 1000 e nunca negativo [cite: 16, 37]
    balance DECIMAL(10, 2) DEFAULT 1000.00 CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);