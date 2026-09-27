# Trocaí

Plataforma de empréstimo de ferramentas e serviços comunitários. Projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas da UNOESC.

## Stack

| Camada   | Tecnologia                                                     |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js 16.1.6 · npm (package-lock.json)                       |
| Backend  | Python 3.14, Django 6, Django REST Framework 3.16              |
| Banco    | PostgreSQL 18 (Docker)                                         |
| Auth     | JWT via SimpleJWT + dj-rest-auth                               |
| Infra    | Oracle Cloud (Ubuntu 24.04) · systemd · Cloudflare Tunnel      |
| CI/CD    | GitHub Actions (`.github/workflows/deploy.yml`)                |

## Arquitetura

```
[Next.js :3000]  ──JWT Bearer──  [Django API :8000]  ──  [PostgreSQL :5432]
```

API-First: o backend expõe uma REST API independente consumida pelo frontend.

## Estrutura do repositório

```
app/
  api/          # Django — backend (+ docker-compose.yml do PostgreSQL)
  web/          # Next.js — frontend
infra/
  README.md     # Provisionamento da VPS e limitações conhecidas
  deploy.sh     # Script executado na VPS a cada deploy
  systemd/      # Units trocai-api e trocai-web
  cloudflared/  # Configuração de exemplo do Cloudflare Tunnel
doc/            # Documentação das entregas (relatórios e diagramas)
.github/
  workflows/    # deploy.yml (GitHub Actions)
```

## Como rodar localmente

### Pré-requisitos

- Docker e Docker Compose
- Python 3.14 + virtualenv
- Node.js + npm

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

Testes do backend:

```bash
python manage.py test
```

### Frontend

```bash
cd app/web
npm ci
npm run dev
```

Frontend disponível em `http://localhost:3000`

Verificações do frontend:

```bash
npm run lint
npm run typecheck
```

## Autenticação

O Django gerencia toda a autenticação. O Next.js é apenas consumidor de tokens.

| Endpoint                        | Descrição               |
| ------------------------------- | ----------------------- |
| `POST /api/auth/login/`         | Login (retorna JWT)     |
| `POST /api/auth/registration/`  | Registro                |
| `POST /api/auth/token/refresh/` | Renovar access token    |
| `POST /api/auth/logout/`        | Logout                  |
| `GET /api/auth/user/`           | Dados do usuário logado |

## Apps do backend

| App             | Responsabilidade                |
| --------------- | ------------------------------- |
| `accounts`      | Usuários, perfil e autenticação |
| `items`         | Itens e categorias              |
| `loans`         | Empréstimos                     |
| `reviews`       | Avaliações pós-empréstimo       |
| `notifications` | Notificações in-app             |
| `reports`       | Denúncias                       |
| `chat`          | Mensagens entre usuários        |

## Deploy

A aplicação roda em uma máquina virtual da camada **Always Free do Oracle Cloud** (Ampere A1 · ARM · Ubuntu 24.04), compartilhada com outros projetos:

- **trocai-web.service** (systemd) — Next.js em `127.0.0.1:3002`
- **trocai-api.service** (systemd) — Gunicorn (3 workers) + Django em `127.0.0.1:8000`
- **trocai-db** (Docker) — PostgreSQL 18 em `127.0.0.1:7510`
- **cloudflared.service** (systemd) — Cloudflare Tunnel; nenhuma porta HTTP/HTTPS aberta na VPS

Todo push na `main` (normalmente via merge de Pull Request) dispara o workflow `deploy.yml`, que acessa a VPS via SSH, sincroniza o código (`git reset --hard origin/main`) e executa o `infra/deploy.sh`: dependências → `pg_dump` (mantém os 5 últimos) → `migrate` → `collectstatic` → `npm ci` → `npm run build` → `systemctl restart`. Um step final do mesmo job verifica a saúde dos serviços.

Segredos usados pelo workflow (GitHub Secrets): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Guia de provisionamento, decisões de infraestrutura e limitações conhecidas: [infra/README.md](infra/README.md).
