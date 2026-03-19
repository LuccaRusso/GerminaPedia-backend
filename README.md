# 🌱 GerminaPedia

> A enciclopédia colaborativa da escola — preservando memórias, conectando pessoas.

GerminaPedia é uma plataforma estilo Wikipedia onde a comunidade escolar pode criar, editar e visualizar wikis sobre alunos, salas, eventos e histórias, com atualizações **em tempo real**.

---

## 📦 Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Frontend | React 19 + Vite 7 | Setup já existente no projeto |
| Roteamento | React Router v7 | Instalado no projeto original |
| Estilo | CSS customizado (design system próprio) | Zero dependência, total controle |
| HTTP Client | Axios | Interceptors para JWT automático |
| Markdown | react-markdown + remark-gfm | Leve, sem editor pesado |
| Real-time | Socket.IO client | Bidirecional, reconnect automático |
| Backend | NestJS 10 + TypeScript | Estrutura modular, decorators, DI nativa |
| ORM | Prisma 5 | Type-safety end-to-end, migrations declarativas |
| Banco | PostgreSQL | Relacional, JSONB para tags, robusto |
| Auth | JWT + Passport + bcrypt | Padrão de mercado, stateless |
| Real-time (server) | Socket.IO (NestJS WebSockets) | Rooms nativas, fallback para polling |
| Documentação API | Swagger/OpenAPI | Auto-gerado via decorators |

**Por que REST e não GraphQL?**  
O modelo de dados é bem definido e as consultas são previsíveis. REST é mais simples de cachear, depurar e escalar. GraphQL traria complexidade sem benefício real aqui.

**Por que Prisma e não TypeORM?**  
Prisma tem melhor DX, type-safety automático (geração de tipos do schema), migrations mais previsíveis e Prisma Studio para inspeção visual.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│              CLIENTE (Browser)               │
│  React 19 + React Router + Socket.IO client  │
└───────────────────┬─────────────────────────┘
                    │ HTTP (REST) + WebSocket
                    ▼
┌─────────────────────────────────────────────┐
│           BACKEND (NestJS)                   │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │  Wikis   │  │ Search   │  │
│  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Alunos  │  │  Salas   │  │ Eventos  │  │
│  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────────────────────┐ │
│  │Histórias │  │  WebSocket Gateway       │ │
│  │  Module  │  │  (Socket.IO /wiki ns)    │ │
│  └──────────┘  └──────────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │       Prisma ORM                        ││
│  └──────────────────┬──────────────────────┘│
└─────────────────────┼───────────────────────┘
                      │
                      ▼
             ┌────────────────┐
             │   PostgreSQL   │
             └────────────────┘
```

### Diagrama Lógico do Banco de Dados

```
users ──────────── wikis (criadoPor, editadoPor)
                      │
                      ├── wiki_versions (histórico)
                      ├── comments
                      │
          ┌───────────┴───────────┐
          │                       │
        alunos ◄──── salas       eventos
          │                       │
          └──── historias ────────┘

N:N Pivots:
  eventos_salas    (eventos ↔ salas)
  eventos_alunos   (eventos ↔ alunos)
  historias_alunos (historias ↔ alunos)
  historias_eventos (historias ↔ eventos)

1:1 (Wiki ↔ Entidade):
  wiki ←→ aluno
  wiki ←→ sala
  wiki ←→ evento
  wiki ←→ historia
```

---

## 📁 Estrutura de Pastas

```
GerminaPedia/              ← Frontend (Vite + React)
├── src/
│   ├── main.jsx           ← Ponto de entrada
│   ├── App.jsx            ← Roteamento
│   ├── index.css          ← Design system global
│   ├── context/
│   │   └── AuthContext.jsx  ← Estado global de auth
│   ├── services/
│   │   ├── api.js           ← Axios + todos os endpoints
│   │   └── socket.js        ← Socket.IO client
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── WikiDetailPage.jsx
│   │   ├── WikiEditorPage.jsx
│   │   ├── WikisListPage.jsx
│   │   ├── AlunosPage.jsx
│   │   ├── SalasPage.jsx
│   │   ├── EventosPage.jsx
│   │   ├── HistoriasPage.jsx
│   │   ├── SearchPage.jsx
│   │   └── LoginPage.jsx
│   └── components/
│       ├── layout/
│       │   └── Layout.jsx     ← Header + Sidebar + Main
│       └── search/
│           └── SearchBar.jsx  ← Busca global com dropdown
├── .env                       ← Variáveis de dev
└── .env.production            ← Variáveis de produção

GerminaPedia-backend/      ← Backend (NestJS)
├── src/
│   ├── main.ts            ← Bootstrap, Swagger, CORS
│   ├── app.module.ts      ← Módulo raiz
│   ├── prisma/            ← Wrapper do Prisma
│   ├── auth/              ← JWT, estratégias, guards
│   ├── users/             ← CRUD de usuários
│   ├── wikis/             ← Wiki + versionamento
│   ├── alunos/
│   ├── salas/
│   ├── eventos/
│   ├── historias/
│   ├── search/            ← Busca global paralela
│   ├── websocket/         ← Socket.IO gateway
│   └── common/
│       └── decorators/    ← @Roles(), @CurrentUser()
├── prisma/
│   ├── schema.prisma      ← Schema completo do banco
│   └── seed.ts            ← Dados iniciais
└── .env                   ← Variáveis de ambiente
```

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### 1. PostgreSQL — criar banco

```bash
psql -U postgres
CREATE DATABASE germinapedia;
\q
```

### 2. Backend

```bash
cd GerminaPedia-backend

# Instalar dependências
npm install

# Copiar .env e preencher
cp .env.example .env
# Edite .env e ajuste DATABASE_URL e JWT_SECRET

# Gerar cliente Prisma
npm run prisma:generate

# Rodar migrations (cria todas as tabelas)
npm run prisma:migrate:dev -- --name init

# Popular com dados de exemplo
npm run prisma:seed

# Iniciar em modo desenvolvimento
npm run start:dev
```

✅ Backend em: `http://localhost:3001`  
✅ Swagger em: `http://localhost:3001/api/docs`

### 3. Frontend

```bash
cd GerminaPedia

# Instalar dependências novas
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

✅ Frontend em: `http://localhost:5173`

### 4. Testar o login

| Role   | Email                        | Senha       |
|--------|------------------------------|-------------|
| Admin  | admin@germinapedia.com       | Admin@123   |
| Editor | editor@germinapedia.com      | Editor@123  |
| Leitor | leitor@germinapedia.com      | Reader@123  |

---

## 🔌 API — Endpoints Principais

### Auth

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@germinapedia.com", "password": "Admin@123" }

→ { "accessToken": "eyJ...", "user": { "id": "...", "name": "...", "role": "ADMIN" } }
```

```http
POST /api/v1/auth/register
Content-Type: application/json

{ "name": "João", "email": "joao@escola.com", "password": "Senha123" }
```

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### Wikis

```http
GET /api/v1/wikis?tipo=ALUNO&page=1&limit=20&search=ana

GET /api/v1/wikis/turma-a-2022

POST /api/v1/wikis
Authorization: Bearer <editor-token>
{
  "slug": "turma-a-2022",
  "titulo": "Turma A — 2022",
  "conteudo": "# Turma A\n\nConteúdo...",
  "tipo": "SALA",
  "status": "PUBLISHED",
  "tags": ["turma", "2022"],
  "salaId": "uuid-da-sala"
}

PUT /api/v1/wikis/:id
Authorization: Bearer <editor-token>
{ "conteudo": "# Atualizado\n...", "comentarioVersao": "Corrigi data" }

GET /api/v1/wikis/:id/versions

POST /api/v1/wikis/:id/versions/:versionId/restore
```

### Busca

```http
GET /api/v1/search?q=formatura&limit=10

→ {
  "query": "formatura",
  "total": 3,
  "wikis": [...],
  "alunos": [],
  "salas": [],
  "eventos": [...],
  "historias": []
}
```

---

## 🔄 Real-time (WebSocket)

O cliente se conecta em `ws://localhost:3001/wiki`.

### Eventos do cliente → servidor

```js
// Entrar na "sala" de uma wiki para receber updates
socket.emit('wiki:join', { wikiId: 'uuid', userId: 'uuid', userName: 'João' })

// Sair
socket.emit('wiki:leave', { wikiId: 'uuid' })

// Indicar que está digitando
socket.emit('wiki:typing', { wikiId: 'uuid', userName: 'João' })
```

### Eventos do servidor → cliente

```js
socket.on('wiki:created', (wiki) => { /* nova wiki criada */ })
socket.on('wiki:updated', (wiki) => { /* wiki atualizada — recebe conteúdo completo */ })
socket.on('wiki:changed', ({ id, slug, titulo, updatedAt }) => { /* update leve para listas */ })
socket.on('wiki:deleted', ({ id }) => { /* wiki deletada */ })
socket.on('editor:joined', ({ socketId, userName, wikiId }) => { /* usuário entrou */ })
socket.on('editor:left', ({ socketId, wikiId }) => { /* usuário saiu */ })
socket.on('editor:typing', ({ userName, wikiId }) => { /* alguém está digitando */ })
```

---

## 🔐 Papéis e Permissões

| Ação | READER | EDITOR | ADMIN |
|------|--------|--------|-------|
| Ver wikis | ✅ | ✅ | ✅ |
| Buscar | ✅ | ✅ | ✅ |
| Criar wiki | ❌ | ✅ | ✅ |
| Editar wiki | ❌ | ✅ | ✅ |
| Deletar wiki | ❌ | ❌ | ✅ |
| Restaurar versão | ❌ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |
| Alterar roles | ❌ | ❌ | ✅ |

---

## 🚀 Deploy em Produção

### Arquitetura recomendada

```
Vercel (Frontend) ──→ Railway (Backend NestJS) ──→ Railway/Supabase (PostgreSQL)
```

### 1. Backend no Railway

1. Acesse [railway.app](https://railway.app) e crie um projeto
2. **Adicione serviço PostgreSQL** (clique em "New" → "Database" → "PostgreSQL")
3. Copie a `DATABASE_URL` gerada
4. **Adicione serviço do backend** (clique em "New" → "GitHub Repo")
5. Selecione o repositório `GerminaPedia-backend`
6. Configure as variáveis de ambiente:

```env
DATABASE_URL=<string-do-railway>
JWT_SECRET=<gere-com: openssl rand -base64 64>
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://germinapedia.vercel.app
```

7. Configure o comando de build:

```
Build Command: npm run build && npm run prisma:migrate:deploy
Start Command: npm run start:prod
```

### 2. Frontend no Vercel

1. Acesse [vercel.com](https://vercel.com) e importe o repositório `GerminaPedia`
2. Configure as variáveis de ambiente:

```env
VITE_API_URL=https://germinapedia-api.railway.app/api/v1
VITE_SOCKET_URL=https://germinapedia-api.railway.app
```

3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output dir: `dist`

### 3. Domínio customizado (opcional)
- Vercel: Configurações → Domains → adicionar domínio
- Railway: Clique no serviço → Settings → Generate Domain

### 4. Rodar seed em produção
```bash
# Via Railway CLI ou console do serviço
npx ts-node prisma/seed.ts
```

---

## 🔧 Variáveis de Ambiente

### Backend (`.env`)
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pwd@host:5432/db` |
| `JWT_SECRET` | Secret do JWT (mínimo 32 chars) | `openssl rand -base64 64` |
| `JWT_EXPIRES_IN` | Validade do token | `7d` |
| `PORT` | Porta do servidor | `3001` |
| `NODE_ENV` | Ambiente | `development` / `production` |
| `FRONTEND_URL` | URL do frontend para CORS | `https://germinapedia.vercel.app` |

### Frontend (`.env`)
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API | `http://localhost:3001/api/v1` |
| `VITE_SOCKET_URL` | URL do servidor WebSocket | `http://localhost:3001` |

---

## 📈 Melhorias Futuras

- [ ] **pg_trgm** — índices de similaridade textual para busca mais inteligente (sem mudar API)
- [ ] **Redis Adapter** — para Socket.IO escalar horizontalmente (múltiplas instâncias)
- [ ] **Upload de imagens** — Cloudinary ou S3
- [ ] **Email notifications** — nodemailer quando uma wiki favorita for editada
- [ ] **PWA** — service worker para uso offline
- [ ] **Diff visual** — mostrar o que mudou entre versões (biblioteca `diff`)
- [ ] **Importação em massa** — CSV de alunos/salas

---

## 🧪 Scripts Úteis

```bash
# Backend
npm run prisma:studio     # Abrir interface visual do banco
npm run prisma:migrate:dev -- --name nome  # Nova migration
npm run prisma:seed       # Repovoar banco (dev)
npm run start:dev         # Dev com hot-reload
npm run build             # Build de produção

# Frontend
npm run dev               # Dev server
npm run build             # Build de produção
npm run preview           # Preview do build
```

---

## 📄 Licença

MIT — GerminaPedia Team
