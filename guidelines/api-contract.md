# 📡 Kamba Kid Pay — Contrato de API

> Documento de referência com todas as rotas, payloads de entrada (request) e resposta (response) por tela e funcionalidade.
>
> **Base URL:** `/api`  
> **Formato:** JSON  
> **Autenticação:** Bearer Token (JWT) via header `Authorization: Bearer <token>`  
> **Moeda:** Kwanza (Kz) em inteiros

---

## Índice

1. [Autenticação](#1-autenticação)
2. [Responsável — Dashboard e Estatísticas](#2-responsável--dashboard-e-estatísticas)
3. [Responsável — Gestão de Dependentes](#3-responsável--gestão-de-dependentes)
4. [Responsável — Tarefas e Aprovações](#4-responsável--tarefas-e-aprovações)
5. [Responsável — Missões](#5-responsável--missões)
6. [Responsável — Campanhas](#6-responsável--campanhas)
7. [Responsável — Finanças e Histórico](#7-responsável--finanças-e-histórico)
8. [Responsável — Família e Perfil](#8-responsável--família-e-perfil)
9. [Criança — Dashboard](#9-criança--dashboard)
10. [Criança — Tarefas](#10-criança--tarefas)
11. [Criança — Missões](#11-criança--missões)
12. [Criança — Solidariedade (Campanhas)](#12-criança--solidariedade-campanhas)
13. [Criança — Escola (Conteúdo Educativo)](#13-criança--escola-conteúdo-educativo)
14. [Avatar e Loja](#14-avatar-e-loja)
15. [Relatórios](#15-relatórios)
16. [Códigos de Erro Padrão](#16-códigos-de-erro-padrão)

---

## 1. Autenticação

### 1.1 Splash / Verificar sessão ativa

**Tela:** `app/index.tsx`

```
GET /api/auth/me
```

**Request:** _(sem body, usa cookie/token de sessão)_

**Response 200 — Sessão válida:**
```json
{
  "id": "usr-abc123",
  "nome": "Pedro Lopes",
  "tipo": "pai",
  "email": "pedro@email.com",
  "criancas": ["crianca-1", "crianca-2"]
}
```

**Response 401 — Sem sessão:**
```json
{
  "erro": "NAO_AUTENTICADO",
  "mensagem": "Sessão inválida ou expirada."
}
```

---

### 1.2 Login

**Tela:** `app/login.tsx`

```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "pedro@email.com",
  "senha": "minhasenha123"
}
```
> ℹ️ O campo `email` também aceita o **nome de utilizador** da criança (ex: `kialo123`).

**Response 200 — Sucesso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "usr-abc123",
    "nome": "Pedro Lopes",
    "tipo": "pai",
    "email": "pedro@email.com"
  }
}
```

**Response 401 — Credenciais inválidas:**
```json
{
  "erro": "CREDENCIAIS_INVALIDAS",
  "mensagem": "Conta não encontrada. Verifique seus dados."
}
```

---

### 1.3 Registo de Responsável

**Tela:** `app/register.tsx`

```
POST /api/auth/register
```

**Request:**
```json
{
  "nome": "Pedro Lopes",
  "email": "pedro@email.com",
  "senha": "minhasenha123",
  "tipo": "pai"
}
```

**Response 201 — Conta criada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "usr-abc123",
    "nome": "Pedro Lopes",
    "tipo": "pai",
    "email": "pedro@email.com",
    "criancas": []
  }
}
```

**Response 409 — Email já em uso:**
```json
{
  "erro": "EMAIL_JA_REGISTADO",
  "mensagem": "Este e-mail já está em uso."
}
```

---

### 1.4 Logout

```
POST /api/auth/logout
```

**Request:** _(sem body)_

**Response 200:**
```json
{
  "mensagem": "Sessão encerrada com sucesso."
}
```

---

## 2. Responsável — Dashboard e Estatísticas

### 2.1 Carregar Painel do Responsável

**Tela:** `app/parent/(tabs)/index.tsx`

```
GET /api/parent/dashboard
```

**Response 200:**
```json
{
  "resumo": {
    "total_dependentes": 2,
    "tarefas_aguardando_aprovacao": 1,
    "taxa_poupanca_media": 51
  },
  "dependentes": [
    {
      "id": "crianca-1",
      "nome": "Kiala",
      "idade": 9,
      "nivel": 5,
      "potes": {
        "saldo_gastar": 3200,
        "saldo_poupar": 4300,
        "saldo_ajudar": 1000,
        "total": 8500
      }
    },
    {
      "id": "crianca-2",
      "nome": "Ngola",
      "idade": 7,
      "nivel": 3,
      "potes": {
        "saldo_gastar": 1500,
        "saldo_poupar": 2000,
        "saldo_ajudar": 500,
        "total": 4000
      }
    }
  ],
  "tarefas_pendentes_aprovacao": [
    {
      "id": "tarefa-4",
      "titulo": "Fazer dever de casa",
      "descricao": "Completar todas as tarefas de matemática",
      "recompensa": 250,
      "status": "aguardando_aprovacao",
      "crianca_id": "crianca-1",
      "foto_url": "https://...",
      "concluido_em": "2026-01-23T10:00:00Z"
    }
  ],
  "missoes_ativas": [
    {
      "id": "missao-1",
      "titulo": "Meta: Novo Jogo",
      "objetivo_valor": 6000,
      "progresso_atual": 4300,
      "crianca_id": "crianca-1"
    }
  ],
  "campanhas_ativas": [
    {
      "id": "campanha-1",
      "titulo": "Merenda Escolar",
      "organizacao": "ONG Kamba Solidário"
    }
  ],
  "desempenho_mensal": [
    { "mes": "Jan", "poupado": 2500, "gasto": 1800, "ajudou": 700 },
    { "mes": "Fev", "poupado": 3200, "gasto": 2100, "ajudou": 900 },
    { "mes": "Mar", "poupado": 4300, "gasto": 3200, "ajudou": 1000 }
  ]
}
```

---

### 2.2 Estatísticas Detalhadas de um Dependente

**Tela:** `app/parent/child-stats/[id].tsx`

```
GET /api/parent/children/:childId/stats
```

**Response 200:**
```json
{
  "crianca": {
    "id": "crianca-1",
    "nome": "Kiala",
    "idade": 9,
    "nivel": 5,
    "potes": {
      "saldo_gastar": 3200,
      "saldo_poupar": 4300,
      "saldo_ajudar": 1000,
      "total": 8500
    }
  },
  "tarefas_concluidas_mes": 8,
  "missoes_completas": 1,
  "doacoes_realizadas": 3,
  "desempenho_semanal": [
    { "semana": "S1", "tarefas": 3, "ganhou": 450 },
    { "semana": "S2", "tarefas": 2, "ganhou": 300 },
    { "semana": "S3", "tarefas": 5, "ganhou": 750 }
  ],
  "historico_recente": [
    {
      "id": "hist-1",
      "tipo": "tarefa",
      "descricao": "Ajudar na cozinha",
      "valor": 100,
      "data": "2026-01-22T00:00:00Z",
      "pote_afetado": "gastar"
    },
    {
      "id": "hist-2",
      "tipo": "doacao",
      "descricao": "Campanha Merenda Escolar",
      "valor": -200,
      "data": "2026-01-20T00:00:00Z",
      "pote_afetado": "ajudar"
    }
  ]
}
```

---

## 3. Responsável — Gestão de Dependentes

### 3.1 Adicionar Dependente

**Tela:** `components/AdicionarDependente.tsx` (modal em `app/parent/(tabs)/index.tsx`)

```
POST /api/parent/children
```

**Request:**
```json
{
  "nome": "Kiala Silva",
  "idade": 9,
  "username": "kiala123",
  "pin": "1234",
  "distribuicao_potes": {
    "poupar_pct": 30,
    "ajudar_pct": 10,
    "gastar_pct": 60
  }
}
```
> - `username`: nome de utilizador escolhido pelo responsável (usado para login da criança)
> - `pin`: senha mínima de 4 caracteres criada pelo responsável para a criança
> - `distribuicao_potes`: percentagens de como o dinheiro ganho será distribuído automaticamente (`poupar_pct` + `ajudar_pct` + `gastar_pct` = 100)

**Response 201:**
```json
{
  "id": "crianca-3",
  "nome": "Kiala Silva",
  "idade": 9,
  "nivel": 1,
  "pai_id": "usr-abc123",
  "username": "kiala123",
  "potes": {
    "saldo_gastar": 0,
    "saldo_poupar": 0,
    "saldo_ajudar": 0,
    "total": 0,
    "config": {
      "gastar_pct": 60,
      "poupar_pct": 30,
      "ajudar_pct": 10
    }
  }
}
```

**Response 400 — Campos obrigatórios em falta:**
```json
{
  "erro": "CAMPOS_OBRIGATORIOS",
  "mensagem": "Preencha todos os campos obrigatórios."
}
```

**Response 400 — PIN muito curto:**
```json
{
  "erro": "PIN_INVALIDO",
  "mensagem": "O PIN deve ter pelo menos 4 caracteres."
}
```

**Response 409 — Username já em uso:**
```json
{
  "erro": "USERNAME_JA_REGISTADO",
  "mensagem": "Este nome de utilizador já está em uso."
}
```

---

### 3.2 Listar Dependentes

```
GET /api/parent/children
```

**Response 200:**
```json
{
  "dependentes": [
    {
      "id": "crianca-1",
      "nome": "Kiala",
      "idade": 9,
      "nivel": 5,
      "potes": {
        "saldo_gastar": 3200,
        "saldo_poupar": 4300,
        "saldo_ajudar": 1000,
        "total": 8500
      }
    }
  ]
}
```

---

### 3.3 Adicionar Saldo Manualmente

**Tela:** `app/parent/(tabs)/index.tsx` (modal de adicionar saldo)

```
POST /api/parent/children/:childId/add-balance
```

**Request:**
```json
{
  "valor": 500,
  "pote": "gastar",
  "descricao": "Mesada de Janeiro"
}
```
> `pote` aceita: `"gastar"`, `"poupar"`, `"ajudar"`

**Response 200:**
```json
{
  "mensagem": "Saldo adicionado com sucesso.",
  "potes_atualizados": {
    "saldo_gastar": 3700,
    "saldo_poupar": 4300,
    "saldo_ajudar": 1000,
    "total": 9000
  }
}
```

---

## 4. Responsável — Tarefas e Aprovações

### 4.1 Criar Tarefa

**Tela:** `app/parent/create-task.tsx`

```
POST /api/tasks
```

**Request:**
```json
{
  "titulo": "Arrumar o quarto",
  "descricao": "Organizar a cama, guardar os brinquedos e limpar a mesa de estudos",
  "recompensa": 150,
  "categoria": "save",
  "crianca_id": "crianca-1",
  "icone": "bed"
}
```
> `categoria` aceita: `"save"` (poupar), `"spend"` (gastar), `"help"` (ajudar)

**Response 201:**
```json
{
  "id": "tarefa-5",
  "titulo": "Arrumar o quarto",
  "descricao": "Organizar a cama, guardar os brinquedos e limpar a mesa de estudos",
  "recompensa": 150,
  "status": "pendente",
  "crianca_id": "crianca-1",
  "icone": "bed",
  "categoria": "save",
  "criado_em": "2026-01-24T08:00:00Z"
}
```

**Response 400 — Campos em falta:**
```json
{
  "erro": "CAMPOS_OBRIGATORIOS",
  "mensagem": "Preencha todos os campos obrigatórios."
}
```

---

### 4.2 Listar Tarefas (por responsável)

**Tela:** `app/parent/(tabs)/tasks.tsx`

```
GET /api/tasks?crianca_id=crianca-1&status=aguardando_aprovacao
```
> Parâmetros opcionais: `crianca_id`, `status` (`pendente`, `aguardando_aprovacao`, `concluida`, `rejeitada`)

**Response 200:**
```json
{
  "tarefas": [
    {
      "id": "tarefa-4",
      "titulo": "Fazer dever de casa",
      "descricao": "Completar todas as tarefas de matemática",
      "recompensa": 250,
      "status": "aguardando_aprovacao",
      "crianca_id": "crianca-1",
      "foto_url": "https://images.unsplash.com/...",
      "icone": "pencil",
      "categoria": "save",
      "criado_em": "2026-01-23T00:00:00Z",
      "concluido_em": "2026-01-23T14:00:00Z"
    }
  ]
}
```

---

### 4.3 Aprovar Tarefa

**Tela:** `app/parent/(tabs)/index.tsx` / `app/parent/approve.tsx`

```
PATCH /api/tasks/:taskId/approve
```

**Request:** _(sem body obrigatório)_
```json
{}
```

**Response 200:**
```json
{
  "mensagem": "Tarefa aprovada com sucesso!",
  "tarefa": {
    "id": "tarefa-4",
    "status": "concluida",
    "aprovado_em": "2026-01-24T09:00:00Z"
  },
  "recompensa_creditada": {
    "valor": 250,
    "pote": "poupar",
    "novo_saldo_pote": 4550
  }
}
```

---

### 4.4 Rejeitar Tarefa

**Tela:** `app/parent/(tabs)/index.tsx` / `app/parent/approve.tsx`

```
PATCH /api/tasks/:taskId/reject
```

**Request:**
```json
{
  "motivo": "A foto não mostra o quarto organizado."
}
```
> `motivo` é opcional mas recomendado.

**Response 200:**
```json
{
  "mensagem": "Tarefa rejeitada.",
  "tarefa": {
    "id": "tarefa-4",
    "status": "rejeitada",
    "rejeitado_em": "2026-01-24T09:00:00Z",
    "motivo_rejeicao": "A foto não mostra o quarto organizado."
  }
}
```

---

### 4.5 Listar Tarefas Pendentes de Aprovação

**Tela:** `app/parent/approve.tsx`

```
GET /api/tasks?status=aguardando_aprovacao
```

**Response 200:**
```json
{
  "tarefas": [
    {
      "id": "tarefa-4",
      "titulo": "Fazer dever de casa",
      "descricao": "Completar todas as tarefas de matemática",
      "recompensa": 250,
      "status": "aguardando_aprovacao",
      "crianca_id": "crianca-1",
      "crianca_nome": "Kiala",
      "foto_url": "https://cdn.kambapay.ao/tarefas/tarefa-4-prova.jpg",
      "icone": "pencil",
      "categoria": "save",
      "criado_em": "2026-01-23T00:00:00Z",
      "concluido_em": "2026-01-23T14:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 5. Responsável — Missões

### 5.1 Criar Missão

**Tela:** `app/parent/create-mission.tsx`

```
POST /api/missions
```

**Request:**
```json
{
  "titulo": "Meta: Novo Jogo",
  "descricao": "Economize 6.000 Kz para comprar um novo jogo",
  "tipo": "poupanca",
  "objetivo_valor": 6000,
  "recompensa": 500,
  "icone": "🎮",
  "crianca_id": "crianca-1"
}
```
> `tipo` aceita: `"poupanca"`, `"consumo"`, `"solidariedade"`

**Response 201:**
```json
{
  "id": "missao-4",
  "titulo": "Meta: Novo Jogo",
  "descricao": "Economize 6.000 Kz para comprar um novo jogo",
  "tipo": "poupanca",
  "objetivo_valor": 6000,
  "progresso_atual": 0,
  "recompensa": 500,
  "icone": "🎮",
  "ativa": true,
  "crianca_id": "crianca-1",
  "criado_em": "2026-01-24T09:00:00Z"
}
```

---

### 5.2 Listar Missões

**Tela:** `app/parent/(tabs)/goals.tsx`

```
GET /api/missions?crianca_id=crianca-1&ativa=true
```

**Response 200:**
```json
{
  "missoes": [
    {
      "id": "missao-1",
      "titulo": "Meta: Novo Jogo",
      "descricao": "Economize 6.000 Kz para comprar um novo jogo",
      "tipo": "poupanca",
      "objetivo_valor": 6000,
      "progresso_atual": 4300,
      "recompensa": 500,
      "icone": "🎮",
      "cor": ["#BF5AF2", "#A335EE"],
      "tipo_label": "Poupança",
      "icone_nome": "trending-up",
      "ativa": true,
      "crianca_id": "crianca-1"
    }
  ]
}
```

---

### 5.3 Atualizar Progresso de Missão

```
PATCH /api/missions/:missionId/progress
```

**Request:**
```json
{
  "novo_progresso": 5000
}
```

**Response 200:**
```json
{
  "id": "missao-1",
  "progresso_atual": 5000,
  "objetivo_valor": 6000,
  "percentagem": 83,
  "concluida": false
}
```

---

## 6. Responsável — Campanhas

### 6.1 Criar Campanha

**Tela:** `app/parent/create-campaign.tsx`

```
POST /api/campaigns
```

**Request:**
```json
{
  "titulo": "Merenda Escolar",
  "descricao": "Ajude a fornecer merenda para crianças em escolas rurais de Angola",
  "meta_valor": 50000,
  "organizacao": "ONG Kamba Solidário",
  "causa": "educacao",
  "imagem_url": "https://..."
}
```
> `causa` aceita: `"educacao"`, `"saude"`, `"ambiente"`, `"alimentacao"`, `"outro"`

**Response 201:**
```json
{
  "id": "campanha-4",
  "titulo": "Merenda Escolar",
  "descricao": "Ajude a fornecer merenda para crianças em escolas rurais de Angola",
  "meta_valor": 50000,
  "valor_arrecadado": 0,
  "imagem_url": "https://...",
  "ativa": true,
  "organizacao": "ONG Kamba Solidário",
  "causa": "educacao",
  "criado_em": "2026-01-24T09:00:00Z"
}
```

---

### 6.2 Listar Campanhas

**Tela:** `app/parent/(tabs)/campaigns.tsx`

```
GET /api/campaigns?ativa=true
```

**Response 200:**
```json
{
  "campanhas": [
    {
      "id": "campanha-1",
      "titulo": "Merenda Escolar",
      "descricao": "Ajude a fornecer merenda para crianças em escolas rurais de Angola",
      "meta_valor": 50000,
      "valor_arrecadado": 32500,
      "imagem_url": "https://...",
      "ativa": true,
      "organizacao": "ONG Kamba Solidário",
      "causa": "educacao",
      "criado_em": "2026-01-20T00:00:00Z"
    }
  ]
}
```

---

## 7. Responsável — Finanças e Histórico

### 7.1 Visualizar Saldos e Histórico

**Tela:** `app/parent/(tabs)/finance.tsx`

```
GET /api/parent/children/:childId/finance
```

**Response 200:**
```json
{
  "potes": {
    "saldo_gastar": 3200,
    "saldo_poupar": 4300,
    "saldo_ajudar": 1000,
    "total": 8500
  },
  "historico": [
    {
      "id": "hist-1",
      "tipo": "tarefa",
      "descricao": "Ajudar na cozinha",
      "valor": 100,
      "data": "2026-01-22T00:00:00Z",
      "pote_afetado": "gastar"
    },
    {
      "id": "hist-2",
      "tipo": "compra",
      "descricao": "Óculos de Sol",
      "valor": -300,
      "data": "2026-01-20T00:00:00Z",
      "pote_afetado": "gastar"
    },
    {
      "id": "hist-3",
      "tipo": "doacao",
      "descricao": "Campanha Merenda Escolar",
      "valor": -200,
      "data": "2026-01-18T00:00:00Z",
      "pote_afetado": "ajudar"
    }
  ]
}
```

---

## 8. Responsável — Família e Perfil

**Tela:** `app/parent/(tabs)/family.tsx`

### 8.1 Atualizar Dados do Dependente

```
PATCH /api/parent/children/:childId
```

**Request:**
```json
{
  "nome": "Kiala da Silva",
  "idade": 10
}
```

**Response 200:**
```json
{
  "id": "crianca-1",
  "nome": "Kiala da Silva",
  "idade": 10,
  "nivel": 5
}
```

---

### 8.2 Atualizar Distribuição de Potes do Dependente

```
PATCH /api/parent/children/:childId/potes-config
```

**Request:**
```json
{
  "poupar_pct": 40,
  "ajudar_pct": 15,
  "gastar_pct": 45
}
```

**Response 200:**
```json
{
  "mensagem": "Configuração dos potes atualizada.",
  "config": {
    "gastar_pct": 45,
    "poupar_pct": 40,
    "ajudar_pct": 15
  }
}
```

---

## 9. Criança — Dashboard

### 9.1 Carregar Dashboard da Criança

**Tela:** `app/child/(tabs)/index.tsx`

```
GET /api/child/dashboard
```

**Response 200:**
```json
{
  "crianca": {
    "id": "crianca-1",
    "nome": "Kiala",
    "idade": 9,
    "nivel": 5,
    "avatar": {
      "id": "avatar-1",
      "cabelo": "afro",
      "roupa": "casual_colorida",
      "acessorio": "oculos_sol",
      "cor_pele": "marrom",
      "expressao": "feliz"
    },
    "potes": {
      "saldo_gastar": 3200,
      "saldo_poupar": 4300,
      "saldo_ajudar": 1000,
      "total": 8500,
      "config": {
        "gastar": {
          "label": "Pote Gastar",
          "descricao": "Para uso imediato",
          "cor": ["#FF6B00", "#FF8C00"],
          "icone": "cart-outline"
        },
        "poupar": {
          "label": "Pote Poupar",
          "descricao": "Metas futuras",
          "cor": ["#4BD37B", "#2ECC71"],
          "icone": "target"
        },
        "ajudar": {
          "label": "Pote Ajudar",
          "descricao": "Solidariedade",
          "cor": ["#FFD130", "#FBC02D"],
          "icone": "heart-outline"
        }
      }
    }
  },
  "tarefas_do_dia": [
    {
      "id": "tarefa-1",
      "titulo": "Arrumar o quarto",
      "descricao": "Organizar a cama, guardar os brinquedos e limpar a mesa de estudos",
      "recompensa": 150,
      "status": "pendente",
      "icone": "bed",
      "categoria": "save"
    }
  ],
  "missao_destaque": {
    "id": "missao-1",
    "titulo": "Meta: Novo Jogo",
    "icone": "🎮",
    "objetivo_valor": 6000,
    "progresso_atual": 4300,
    "faltam": 1700
  }
}
```

---

## 9. Criança — Tarefas

### 9.1 Listar Tarefas da Criança

**Tela:** `app/child/(tabs)/tasks.tsx`

```
GET /api/child/tasks?status=pendente
```
> `status` aceita: `"pendente"`, `"aguardando_aprovacao"`, `"concluida"`, `"rejeitada"` (opcional — sem filtro retorna todas)

**Response 200:**
```json
{
  "tarefas": [
    {
      "id": "tarefa-1",
      "titulo": "Arrumar o quarto",
      "descricao": "Organizar a cama, guardar os brinquedos e limpar a mesa de estudos",
      "recompensa": 150,
      "status": "pendente",
      "icone": "bed",
      "categoria": "save",
      "criado_em": "2026-01-23T00:00:00Z"
    },
    {
      "id": "tarefa-4",
      "titulo": "Fazer dever de casa",
      "descricao": "Completar todas as tarefas de matemática",
      "recompensa": 250,
      "status": "aguardando_aprovacao",
      "icone": "pencil",
      "categoria": "save",
      "foto_url": "https://...",
      "criado_em": "2026-01-23T00:00:00Z",
      "concluido_em": "2026-01-23T14:00:00Z"
    }
  ]
}
```

---

### 9.2 Submeter Tarefa com Foto (Prova de Conclusão)

**Tela:** `app/child/submit-task.tsx`

```
PATCH /api/child/tasks/:taskId/submit
Content-Type: multipart/form-data
```

**Request (multipart):**
```
foto: <arquivo de imagem>
```

> Alternativamente (se usando base64):

```json
{
  "foto_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "foto_mime_type": "image/jpeg"
}
```

**Response 200:**
```json
{
  "mensagem": "Tarefa enviada para aprovação!",
  "tarefa": {
    "id": "tarefa-1",
    "status": "aguardando_aprovacao",
    "foto_url": "https://cdn.kambapay.ao/tarefas/tarefa-1-prova.jpg",
    "concluido_em": "2026-01-24T10:00:00Z"
  }
}
```

**Response 400 — Foto em falta:**
```json
{
  "erro": "FOTO_OBRIGATORIA",
  "mensagem": "Tire uma foto ou selecione uma imagem como prova."
}
```

**Response 404 — Tarefa não encontrada:**
```json
{
  "erro": "TAREFA_NAO_ENCONTRADA",
  "mensagem": "A tarefa solicitada não foi encontrada."
}
```

---

## 10. Criança — Missões

### 10.1 Listar Missões da Criança

**Tela:** `app/child/(tabs)/missions.tsx`

```
GET /api/child/missions?tipo=poupanca
```
> `tipo` aceita: `"poupanca"`, `"consumo"`, `"solidariedade"` (opcional — sem filtro retorna todas)

**Response 200:**
```json
{
  "missoes": [
    {
      "id": "missao-1",
      "titulo": "Meta: Novo Jogo",
      "descricao": "Economize 6.000 Kz para comprar um novo jogo",
      "tipo": "poupanca",
      "tipo_label": "Poupança",
      "objetivo_valor": 6000,
      "progresso_atual": 4300,
      "percentagem": 72,
      "faltam": 1700,
      "recompensa": 500,
      "icone": "🎮",
      "icone_nome": "trending-up",
      "cor": ["#BF5AF2", "#A335EE"],
      "ativa": true
    },
    {
      "id": "missao-2",
      "titulo": "Consumidor Consciente",
      "descricao": "Gaste com sabedoria e não exceda 4.000 Kz este mês",
      "tipo": "consumo",
      "tipo_label": "Consumo",
      "objetivo_valor": 4000,
      "progresso_atual": 3200,
      "percentagem": 80,
      "faltam": 800,
      "recompensa": 300,
      "icone": "🛒",
      "icone_nome": "cart",
      "cor": ["#0984E3", "#0652DD"],
      "ativa": true
    }
  ]
}
```

---

## 11. Criança — Solidariedade (Campanhas)

### 11.1 Listar Campanhas Disponíveis

**Tela:** `app/child/(tabs)/help.tsx`

```
GET /api/campaigns?ativa=true
```

**Response 200:** _(igual ao endpoint 6.2)_

---

### 11.2 Realizar Doação

**Tela:** `app/child/(tabs)/help.tsx`

```
POST /api/child/donations
```

**Request:**
```json
{
  "campanha_id": "campanha-1",
  "valor": 200
}
```

**Response 200:**
```json
{
  "mensagem": "Doação realizada com sucesso! Você é um herói! ✨",
  "doacao": {
    "id": "doacao-1",
    "campanha_id": "campanha-1",
    "campanha_titulo": "Merenda Escolar",
    "valor": 200,
    "data": "2026-01-24T10:00:00Z"
  },
  "pote_ajudar_atualizado": {
    "saldo_anterior": 1000,
    "saldo_atual": 800
  },
  "campanha_atualizada": {
    "id": "campanha-1",
    "valor_arrecadado": 32700,
    "meta_valor": 50000,
    "percentagem": 65
  }
}
```

**Response 400 — Saldo insuficiente:**
```json
{
  "erro": "SALDO_INSUFICIENTE",
  "mensagem": "O seu Pote Ajudar não tem saldo suficiente para esta doação."
}
```

---

## 12. Criança — Escola (Conteúdo Educativo)

### 12.1 Listar Conteúdo Educativo

**Tela:** `app/child/(tabs)/school.tsx`

```
GET /api/educational-content?faixa_etaria=9-10
```
> `faixa_etaria` aceita: `"6-8"`, `"9-10"`, `"11-12"` (opcional)

**Response 200:**
```json
{
  "conteudos": [
    {
      "id": "conteudo-1",
      "titulo": "O que é Kwanza?",
      "descricao": "Aprenda sobre a moeda de Angola",
      "tipo": "video",
      "faixa_etaria": "6-8",
      "thumbnail_url": "https://...",
      "duracao": "3:45",
      "topico": "moeda",
      "completo": true
    },
    {
      "id": "conteudo-3",
      "titulo": "Como fazer orçamento",
      "descricao": "Planeje seus gastos mensais",
      "tipo": "video",
      "faixa_etaria": "9-10",
      "thumbnail_url": "https://...",
      "duracao": "6:15",
      "topico": "orcamento",
      "completo": false
    }
  ]
}
```

---

### 12.2 Marcar Conteúdo como Completo

```
PATCH /api/educational-content/:contentId/complete
```

**Request:** _(sem body)_

**Response 200:**
```json
{
  "mensagem": "Conteúdo marcado como concluído!",
  "conteudo_id": "conteudo-3",
  "xp_ganho": 50,
  "novo_nivel": 5
}
```

---

## 13. Avatar e Loja

### 13.1 Listar Itens da Loja

**Tela:** `app/child/(tabs)/index.tsx` (secção avatar)

```
GET /api/shop/items?crianca_id=crianca-1
```

**Response 200:**
```json
{
  "itens": [
    {
      "id": "item-1",
      "nome": "Cabelo Afro com Tranças",
      "tipo": "cabelo",
      "preco": 500,
      "nivel_necessario": 3,
      "desbloqueado": true,
      "imagem_url": null
    },
    {
      "id": "item-4",
      "nome": "Coroa Tradicional",
      "tipo": "acessorio",
      "preco": 1200,
      "nivel_necessario": 8,
      "desbloqueado": false,
      "imagem_url": null
    }
  ]
}
```

---

### 13.2 Comprar Item da Loja

```
POST /api/shop/purchase
```

**Request:**
```json
{
  "item_id": "item-4",
  "crianca_id": "crianca-1"
}
```

**Response 200:**
```json
{
  "mensagem": "Item comprado com sucesso!",
  "item_comprado": {
    "id": "item-4",
    "nome": "Coroa Tradicional",
    "tipo": "acessorio"
  },
  "pote_gastar_atualizado": {
    "saldo_anterior": 3200,
    "saldo_atual": 2000
  }
}
```

**Response 400 — Nível insuficiente:**
```json
{
  "erro": "NIVEL_INSUFICIENTE",
  "mensagem": "Você precisa estar no nível 8 para desbloquear este item."
}
```

**Response 400 — Saldo insuficiente:**
```json
{
  "erro": "SALDO_INSUFICIENTE",
  "mensagem": "O seu Pote Gastar não tem saldo suficiente."
}
```

---

### 13.3 Atualizar Avatar

```
PUT /api/child/avatar
```

**Request:**
```json
{
  "crianca_id": "crianca-1",
  "cabelo": "afro_trancas",
  "roupa": "casual_colorida",
  "acessorio": "coroa_tradicional",
  "cor_pele": "marrom",
  "expressao": "feliz"
}
```

**Response 200:**
```json
{
  "mensagem": "Avatar atualizado!",
  "avatar": {
    "id": "avatar-1",
    "cabelo": "afro_trancas",
    "roupa": "casual_colorida",
    "acessorio": "coroa_tradicional",
    "cor_pele": "marrom",
    "expressao": "feliz"
  }
}
```

---

## 14. Relatórios

### 14.1 Relatório de Progresso Mensal

**Tela:** `app/parent/(tabs)/index.tsx` (botão de exportar)

```
GET /api/reports/progress?crianca_id=crianca-1&periodo=2026-01
```

**Response 200:**
```json
{
  "crianca_id": "crianca-1",
  "periodo": "2026-01",
  "tarefas_concluidas": 8,
  "total_ganho": 1850,
  "missoes_completas": 1,
  "doacoes_realizadas": 3,
  "meta_poupanca_progresso": 72,
  "resumo_whatsapp": "📊 *Relatório Kamba Kid Pay - Kiala*\n\n💰 Saldo Total: 8.500 Kz\n✅ Tarefas Concluídas: 8\n💚 Taxa de Poupança: 51%\n\n📦 Distribuição:\n• Gastar: 3.200 Kz\n• Poupar: 4.300 Kz\n• Ajudar: 1.000 Kz\n\nContinue incentivando a educação financeira! 🎯"
}
```

---

## 15. Códigos de Erro Padrão

| Código HTTP | Código de Erro                | Descrição                                      |
|-------------|-------------------------------|------------------------------------------------|
| `400`       | `DADOS_INVALIDOS`             | Payload com campos inválidos ou em falta       |
| `400`       | `CAMPOS_OBRIGATORIOS`         | Campos obrigatórios não foram enviados         |
| `400`       | `SALDO_INSUFICIENTE`          | Saldo no pote é insuficiente para a operação   |
| `400`       | `NIVEL_INSUFICIENTE`          | Nível da criança não atinge o mínimo exigido   |
| `400`       | `FOTO_OBRIGATORIA`            | Submissão de tarefa sem foto de prova          |
| `401`       | `NAO_AUTENTICADO`             | Token JWT ausente, inválido ou expirado        |
| `403`       | `SEM_PERMISSAO`               | Utilizador não tem acesso a este recurso       |
| `404`       | `TAREFA_NAO_ENCONTRADA`       | Tarefa com o ID fornecido não existe           |
| `404`       | `CRIANCA_NAO_ENCONTRADA`      | Dependente com o ID fornecido não existe       |
| `404`       | `CAMPANHA_NAO_ENCONTRADA`     | Campanha com o ID fornecido não existe         |
| `409`       | `EMAIL_JA_REGISTADO`          | E-mail já em uso no registo                    |
| `500`       | `ERRO_INTERNO`                | Erro inesperado no servidor                    |

**Formato de erro padrão:**
```json
{
  "erro": "CODIGO_DO_ERRO",
  "mensagem": "Descrição legível por humanos."
}
```

---

> 📝 **Nota de implementação:** Este contrato foi derivado do código do frontend (`types/index.ts`, `data/mockData.ts` e todos os ecrãs da app). Todos os campos usam a mesma tipagem definida em `types/index.ts`. A moeda é sempre em **Kwanza inteiro (Kz)**. As datas seguem o formato **ISO 8601 (UTC)**.
