**📄 Contrato da API – BichoFull**

* Base URL
  - http://localhost:8080/api
  
* Formato
  - JSON
  - UTF-8

* Autenticação
  - JWT (Bearer TOKEN)

 ---
 
## Autenticação

### **POST /auth/register**

**Request (Frontend envia)**
```{
  "nome": "Larissa",
  "email": "larissa@email.com",
  "senha": "123456"
}
```
**Response (Backend retorna)**
```{
  "id": 1,
  "nome": "Larissa",
  "email": "larissa@email.com",
  "saldo": 1000.00,
  "role": "USER"
}
```

### **POST /auth/login**
**Request**
```{
  "email": "larissa@email.com",
  "senha": "123456"
}
```
```Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer"
}
```

## Animals

### **GET /animals**
```Response
[
  {
    "id": 1,
    "grupo": 1,
    "nome": "Avestruz",
    "dezenas": ["01","02","03","04"]
  }
]
```

## Apostas

### **POST /bet**
```Request
{
  "tipo": "GRUPO",
  "numeroApostado": "01",
  "valor": 50.00
}
```
```Response
{
  "id": 10,
  "tipo": "GRUPO",
  "numeroApostado": "01",
  "valor": 50.00,
  "status": "PENDING",
  "saldoAtual": 950.00
}
```
### **GET /bets/history**
```Response
[
  {
    "id": 10,
    "tipo": "GRUPO",
    "numeroApostado": "01",
    "valor": 50.00,
    "status": "WON",
    "premioRecebido": 900.00,
    "data": "2026-02-19T10:00:00"
  }
]
```

## Sorteio

### **POST /draw (ADMIN)**
```Response
{
  "id": 5,
  "data": "2026-02-19T12:00:00",
  "premio1": "1234",
  "premio2": "5678",
  "premio3": "9012",
  "premio4": "3456",
  "premio5": "7890"
}
```

## Saldo
### **GET /balance**
```Response
{
  "saldo": 1350.00
}
```
