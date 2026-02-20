# BichoFull-Jogo-do-Bicho

---
## 📌 Sobre o Projeto

O BichoFull é uma aplicação web Full Stack desenvolvida para fins educacionais, que simula a mecânica clássica do Jogo do Bicho.

O sistema permite que usuários:
  - Criem contas
  - Gerenciem uma carteira virtual
  - Realizem apostas simuladas
  - Acompanhem resultados
  - Consultem histórico de ganhos e perdas

## 🏗 Arquitetura do Sistema

O projeto segue arquitetura Full Stack com API REST, dividida em:

  - 🔙 Backend: Spring Boot
  - 🎨 Frontend: Angular
  - 🗄 Banco de Dados: MySQL
  - 🔐 Autenticação: JWT
  - 📘 Documentação: Swagger (OpenAPI)
  - ⚙️ CI/CD: GitHub Actions


## 🧱 Arquitetura Backend (Spring Boot)

O projeto usa o padrão MVC + Camadas de Serviço.

  - Controller → Service → Security → Repository → Database


## 📦 Funcionalidades
  - Autenticação
  - Cadastro e exclusão de usuário
  - Saldo inicial automático (R$ 1.000,00)


## 🎰 Sistema de Apostas

Tipos de aposta:
  - Grupo (1 a 25)
  - Dezena (00 a 99)
  - Centena (000 a 999)
  - Milhar (0000 a 9999)

Regras:
  - Não permite saldo negativo
  - Valida saldo antes da aposta
  - Registra histórico

## 📝 Licença

Este projeto é destinado exclusivamente para fins acadêmicos e educacionais.
