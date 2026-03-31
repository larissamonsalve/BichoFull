-- Adiciona a coluna de versionamento otimista na tabela users
ALTER TABLE users ADD COLUMN version BIGINT DEFAULT 0;