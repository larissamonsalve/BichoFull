# 🕹️ BichoFull - Simulador Arcade de Jogo do Bicho
---

**Status:** Em produção na AWS! Acesse: [http://3.134.102.174](http://3.134.102.174)

O **BichoFull** é um ecossistema digital que simula a mecânica do tradicional Jogo do Bicho brasileiro através de um sistema de fichas virtuais. O projeto utiliza uma arquitetura com Spring Boot no backend e Angular no frontend. A infraestrutura é totalmente containerizada com Docker, contando com versionamento de banco de dados via Flyway, documentação técnica automatizada com Swagger e uso de boas práticas com o ESLint e Prettier. A plataforma oferece uma experiência de usuário imersiva, com interface totalmente responsiva e estética retrô inspirada em máquinas de arcade.

---

## 📸 Demonstração do Sistema

**| Home |**

![Home](docs/screenshots/home.png)  

**| Apostas |**

![Dashboard](docs/screenshots/dashboard.png) 

**| Sorteios |**

![SorteioS](docs/screenshots/draws.png) 
  
---

## 🛠️ Tecnologias e Arquitetura Utilizadas

---

O sistema foi construído sobre uma **Arquitetura em Camadas (Layered Architecture)**, separando responsabilidades para facilitar a manutenção e os testes.

### **Backend (Java/Spring Boot)**

*  **Java 17+ e Spring Boot 3:** Uso de Records para imutabilidade e Standalone Components.

*  **Camada de Controller:** Gerencia os endpoints REST e a comunicação com o Frontend.

*  **Camada de Service:** Centraliza as regras de negócio, como o cálculo de grupos de animais e processamento de prêmios.

*  **Camada de Repository:** Abstração do banco de dados via Spring Data JPA.

*  **Domain-Driven Design (DDD)**: Lógica financeira encapsulada na entidade User.

*  **Segurança:** Autenticação Stateless com **JWT (JSON Web Token)** e criptografia de senhas com **BCrypt**.

*  **Processamento Agendado**: Sorteios automáticos realizados via Spring Scheduler com cron jobs.

*  **Banco de Dados:** MySQL com controle de versão via **Flyway Migrations** (V1 a V5).

  
### **Frontend (Angular 18)**

*  **Signals:** Gerenciamento de estado reativo para atualização em tempo real do saldo e mensagens.

*  **Standalone Components:** Estrutura modular moderna sem a necessidade de NgModules.

*  **Interceptors:** Anexação automática do token JWT em todas as requisições autenticadas.

* **Functional Guards**: Proteção de rotas baseada em autenticação e níveis de acesso (Admin/Player).

*  **Responsividade:** Design totalmente responsivo e acessível para uso em dispositivos móveis.

*  **ESLint:** impede que o código tenha variáveis não utilizadas, obriga o uso de boas práticas do Angular 18 e mantém a consistência entre os componentes.
    
*  **Prettier:** Focado na estética. Formata automaticamente as quebras de linha, o uso de aspas e a indentação toda vez que um arquivo é salvo no projeto, evitando conflitos de estilo no Git entre diferentes desenvolvedores.

### **API RESTful**

API documentada utilizando o padrão **OpenAPI 3 (Swagger)**. Nela, é possível visualizar todos os endpoints, os modelos de dados (DTOs) e testar as requisições diretamente pelo navegador.

### **Arquitetura de Contêineres (Docker)**

O sistema é totalmente orquestrado via Docker Compose, permitindo subir a infraestrutura completa com um único comando:

* **Serviço de Base de Dados**: MySQL 8.0 com persistência de volumes.

* **Serviço Backend**: Contentor Java 21 (JRE) compilado via Maven.

* **Serviço Frontend**: Servidor Nginx que serve os ficheiros estáticos do Angular e redireciona chamadas /api para o backend.

---

## 📝 Regras de Negócio e Apostas

---

### **Categorias e Multiplicadores**

*  **Grupo**: Acerte o grupo do animal (1-25) |**18x** |

*  **Dezena** | Acerte os 2 últimos dígitos do prêmio | **60x** |

*  **Milhar** | Acerte os 4 dígitos exatos do prêmio | **4000x** |

### **Modos de Jogo**

*  **Simples (Cabeça):** Aposta válida apenas para o 1º prêmio sorteado.

*  **Cercada (1º ao 5º):** O valor apostado é dividido por 5. Se o bicho/número sair em qualquer uma das 5 posições, o usuário ganha proporcionalmente.

---

## ⚡ Principais Funcionalidades

---

| Categoria        | Funcionalidade       | Descrição                                   |              
| ---------------- | -------------------- | ------------------------------------------- | 
| 👤 **Usuário** | Cadastro             | Criação de conta com nome, nome de usuário, e-mail e senha   |               
| 👤 **Usuário** | Login                | Autenticação segura via JWT                 |
| 👤 **Usuário** | Saldo inicial        | R$ 1.000,00 em fichas para começar          |
| 👤 **Usuário** | Carteira virtual     | Saldo atualizado em tempo real              |
|                  |                      |                                             |
| 🎲 **Apostas** | Tabela de animais    | Interface com os 25 grupos do jogo do bicho |
| 🎲 **Apostas** | Aposta por Grupo     | Escolha um animal (1 a 25)                  |
| 🎲 **Apostas** | Aposta por Dezena    | Escolha dois números (00 a 99)              |
| 🎲 **Apostas** | Aposta por Milhar    | Escolha quatro números (0000 a 9999)        |
| 🎲 **Apostas** | Aposta Cercada    | Aposta em qualquer um dos 5 prêmios      |
| 🎲 **Apostas** | Aposta Aleatória    | Aposta gerada aleatoriamente      |
| 🎲 **Apostas** | Aposta Aleatória    | Aposta gerada aleatoriamente      |
| 🎲 **Apostas** | Validação de saldo   | Impede apostas com saldo insuficiente       |
|                  |                      |                                            |
| 🏆 **Sorteios** | Sorteio automático   | Geração aleatória de 5 milhares             |
| 🏆 **Sorteios** | Sorteio manual       | Admin pode simular sorteios                 |
| 🏆 **Sorteios** | Cálculo de prêmios   | Grupo: 18x / Dezena: 60x / Milhar: 4000x | Cercada: Divisão do valor multiplicado por 5 |
|                  |                      |                                             |
| 📊 **Histórico** | Histórico de apostas | Visualização das apostas realizadas         |
| 📊 **Histórico** | Resultados           | Ganhos e perdas por aposta                  |
|                  |                       |                                             |
| 📊 **Admin**    | Relatórios de Vencedores  | Lista dos vencedores dos sorteios        |
| 📊 **Admin**    | Relatórios de Apostas  | Lista das apostas realizadas em tempo real  |

---

## 🚀 Suíte de Testes

---

O projeto inclui testes automatizados para garantir a estabilidade e segurança:

### **Testes de Integração**

*  **ConcurrencyIT:** Cria duas Threads (simulando requisições simultâneas) tentando apostar o mesmo saldo ao mesmo tempo. Valida o bloqueio para impedir que cliques simultâneos dupliquem o saldo.

*  **AuthControllerIT:** simula o comportamento de um usuário tentando se registrar e logar no sistema, verifica se os endpoints `/api/auth/register` e `/api/auth/login` estão expostos corretamente e aceitam o verbo `POST`. Valida se o Spring consegue transformar corretamente os DTOs (`UserRegistrationDTO`, `LoginDTO`) em JSON e vice-versa e confirma que, ao registrar um usuário, os dados passam pelo `Service`, a senha é criptografada pelo `PasswordEncoder` e o registro é salvo com sucesso no MySQL.

*  **DatabaseConstraintTest:** Valida se o banco impede saldos negativos via CHECK constraints.

*  **DrawIT:**: Executa um ciclo completo de sorteio. Insere um Admin e um Jogador reais, realiza o sorteio e verifica se, após a transação, o saldo no banco de dados MySQL foi atualizado corretamente. O uso de `@Transactional` garante que o banco volte ao estado original após o teste.

*  **SecurityAuthorizationIT:** Garante que apenas perfis ADMIN acessem funções críticas de sorteio. Utiliza o Spring Security e o Filtro de Autenticação para barrar requisições não autorizadas.

### **Testes Unitários**

*  **DrawServiceTest:** Valida os multiplicadores corretos (18x, 60x, 4000x) e a divisão de valor para apostas no modo cercado.

*  **TokenServiceTest:** Testa a segurança. Garante que o sistema consegue gerar um Token JWT válido e que ele retorna `null`, bloqueando o acesso se o token for inválido ou adulterado.

*  **UserTest:** Testa se o método `debitBalance` lança uma exceção se o valor for maior que o saldo ou se for um número negativo/zero.

*  **BetServiceTest:** Valida a "matemática do bicho". Testa se, ao apostar na milhar `1242`, o sistema identifica corretamente que o animal é o **Cavalo (Grupo 11)** e se o saldo do usuário é deduzido corretamente no momento da aposta.
 
**Para executar os testes, dentro da pasta backend, digite:**
```bash
./mvnw test
```

---

## 🚀 Instalação e Execução (Passo a Passo)

---

### **1. Pré-requisitos**

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
* Após a instalação, reinicie o computador.
* Abra o Docker Desktop e aguarde que o ícone da baleia fique estável.

### **2. Preparação do Ambiente**

Certifique-se de que a porta 80 (Frontend), 8080 (Backend) e 3306 (MySQL) não estão sendo usadas por outras aplicações.

### **2. Execução**

**1. Clone o repositório:**
\`\`\`bash
git clone https://github.com/larissamonsalve/BichoFull.git
cd BichoFull
\`\`\`

**2. Configure as variáveis de ambiente:**
* Crie um arquivo chamado `.env` na raiz do projeto.
* Copie o conteúdo do arquivo `.env.example` e cole dentro do seu novo `.env`.

**3. Ajuste a URL da API (Frontend):**
Para que o Frontend se conecte ao seu servidor local (e não à minha AWS), abra o arquivo \`frontend/src/environments/environment.ts\` e altere a `apiUrl`:
* De: `apiUrl: 'http://3.134.102.174:8080/api'`
* Para: `apiUrl: 'http://localhost:8080/api'`

**4. Suba os containers com Docker:**
Execute o comando abaixo na raiz do projeto:
\`\`\`bash
docker compose up -d --build
\`\`\`

### **3. Acesse o sistema**

Assim que os logs indicarem que tudo foi iniciado, abra seu navegador em:

* **Frontend**: http://localhost

> **Observação:** O banco de dados subirá vazio. Após criar o seu primeiro usuário, você pode promovê-lo a Administrador acessando o banco via terminal:
\`UPDATE users SET role = 'ADMIN' WHERE username = 'seu_usuario';\`

* **Documentação da API (Swagger)**: http://localhost:8080/swagger-ui/index.html

> **Instrução para Teste de API:** Para endpoints protegidos (como apostas), você deve primeiro realizar o login, copiar o `token` gerado e clicar no botão **Authorize** no topo da página do Swagger, inserindo o valor: `Bearer SEU_TOKEN_GERADO_AQUI`.

### **4. Comandos Úteis**

* **Rodar em background**: docker-compose up -d

* **Parar a aplicação**: docker-compose down

* **Ver logs de erro**: docker-compose logs -f

### 📝 Licença
Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

### ⚠️ Este projeto é destinado exclusivamente para fins acadêmicos.