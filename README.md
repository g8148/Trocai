# Trocai

Plataforma de empréstimo de ferramentas e serviços comunitários. Projeto acadêmico — 3º semestre UNOESC.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js + npm |
| Backend | Python 3.14, Django 6, Django REST Framework 3.16 |
| Banco | PostgreSQL 18.3 (Docker) |
| Auth | JWT via SimpleJWT + dj-rest-auth + django-allauth |

## Arquitetura

```
[Next.js :3000]  ──JWT Bearer──  [Django API :8000]  ──  [PostgreSQL :5432]
```

API-First: o backend expõe uma REST API independente consumida pelo frontend.

## Estrutura do repositório

```
app/
  api/        # Django — backend
  web/        # Next.js — frontend
doc/          # Documentação e diagramas
```

## Como rodar localmente

### Pré-requisitos

- Docker e Docker Compose
- Python 3.14 + virtualenv
- Node.js 22+ (npm)

### Backend

```bash
cd app/api
cp .env.example .env        # preencha as variáveis
docker compose up -d        # sobe o PostgreSQL
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API disponível em `http://localhost:8000`
Documentação Swagger em `http://localhost:8000/api/docs/`

### Frontend

```bash
cd app/web
npm ci
npm run dev
```

Frontend disponível em `http://localhost:3000`

## Autenticação

O Django gerencia toda a autenticação. O Next.js é apenas consumidor de tokens.

| Endpoint | Descrição |
|----------|-----------|
| `POST /api/auth/login/` | Login (retorna JWT) |
| `POST /api/auth/registration/` | Registro |
| `POST /api/auth/token/refresh/` | Renovar access token |
| `POST /api/auth/logout/` | Logout |
| `POST /api/auth/social/google/` | Login via Google |
| `GET /api/auth/user/` | Dados do usuário logado |

## Apps do backend

| App | Responsabilidade |
|-----|-----------------|
| `accounts` | Usuários, perfil, auth social |
| `items` | Itens e categorias |
| `loans` | Empréstimos e reservas |
| `reviews` | Avaliações pós-empréstimo |
| `notifications` | Notificações in-app |
| `reports` | Denúncias |
| `chat` | Mensagens entre usuários |
