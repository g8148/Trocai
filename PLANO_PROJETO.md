# Trocai - Plano do Projeto

Plataforma de emprestimo de ferramentas e servicos comunitarios.

---

## 1. Visao Geral da Arquitetura

```
[Next.js Frontend]  <--JWT Bearer-->  [Django REST API]  <-->  [PostgreSQL 18.3]
     :3000                                 :8000                    :5432 (Docker)
```

- **Frontend**: Next.js (repo separado em `front/`)
- **Backend**: Django 6 + Django REST Framework (repo separado em `back/`)
- **Banco de dados**: PostgreSQL 18.3 via Docker Compose
- **Autenticacao**: JWT centralizado no Django (SimpleJWT + dj-rest-auth + django-allauth)

---

## 2. Estrategia de Autenticacao

### Fluxo escolhido: JWT Centralizado no Django

O Django gerencia TODA a autenticacao. O Next.js e apenas um consumidor de tokens.

**Login tradicional (email/senha):**
1. Next.js envia `POST /api/auth/login/` com `{username, password}`
2. Django valida, retorna `{access_token, refresh_token}`
3. Next.js armazena os tokens e envia `Authorization: Bearer <access_token>` em cada request

**Login social (Google/Apple/Microsoft):**
1. Next.js redireciona o usuario para o provider OAuth
2. Recebe o `authorization_code` de volta
3. Envia `POST /api/auth/social/google/` com `{code}`
4. Django troca o code por dados do usuario via allauth, cria/associa a conta, retorna JWT

**Endpoints de auth disponveis:**
- `POST /api/auth/login/` - Login (retorna JWT)
- `POST /api/auth/registration/` - Registro de novo usuario
- `POST /api/auth/token/refresh/` - Renovar access token
- `POST /api/auth/logout/` - Logout (blacklist do token)
- `POST /api/auth/password/reset/` - Solicitar reset de senha
- `POST /api/auth/password/reset/confirm/` - Confirmar reset
- `GET /api/auth/user/` - Dados do usuario logado
- `POST /api/auth/social/google/` - Login via Google

---

## 3. Estrutura do Backend (Django)

```
back/
  core/              # Configuracao principal do Django
    settings.py      # Settings com DRF, JWT, CORS, allauth
    urls.py          # URLs raiz da API
  accounts/          # Usuarios, perfil, autenticacao social
    models.py        # User customizado (AbstractUser)
    serializers.py   # Serializers de registro e perfil
    views.py         # Views de perfil e login social
    urls.py          # /api/accounts/
    urls_social.py   # /api/auth/social/
  items/             # Itens (ferramentas/servicos)
    models.py        # Category, SubCategory, Item, ItemImage
  loans/             # Emprestimos e reservas
    models.py        # Loan, Reservation
  reviews/           # Avaliacoes
    models.py        # Review
  notifications/     # Notificacoes do sistema
    models.py        # Notification
  reports/           # Denuncias
    models.py        # Report
  chat/              # Chat entre usuarios
    models.py        # Conversation, Message
  docker-compose.yml # PostgreSQL 18.3
  requirements.txt   # Dependencias Python
  .env               # Variaveis de ambiente (NAO commitar)
  .env.example       # Template de variaveis
```

---

## 4. Models e Banco de Dados

### User (accounts)
- UUID como PK
- CPF unico (RNF002)
- Endereco completo + geolocalizacao (lat/lng)
- Raio de busca configuravel (default 5km - RF001)
- Status: disponivel/ausente/bloqueado (RF010)
- Verificacao de email e telefone (RF009)

### Category / SubCategory (items)
- Tipo: Ferramenta ou Servico
- Subcategorias hierarquicas (RF016)

### Item (items)
- Dono (FK para User)
- Subcategoria
- Segregacao: hobby/semi-profissional/profissional
- Condicao: novo/bom/usado/desgastado
- Disponibilidade: disponivel/emprestado/reservado/indisponivel
- Permite reserva (RF005)
- Imagens multiplas (ItemImage)

### Loan (loans)
- Item + borrower + lender
- Status: pendente/aprovado/rejeitado/em andamento/devolvido/atrasado/cancelado/disputa
- Datas de retirada e devolucao (prevista e real)

### Reservation (loans)
- Reserva antecipada de item emprestado (RF005)

### Review (reviews)
- Nota para item (1-5) e nota para usuario (1-5)
- Descricao + foto
- Uma avaliacao por emprestimo

### Notification (notifications)
- Tipos: solicitacao, aprovacao, lembrete de devolucao, etc (RF004)

### Report (reports)
- Denuncias com tipo de alvo, motivo, descricao e evidencia (RF021)

### Conversation / Message (chat)
- Chat interno entre usuarios (RF019)

---

## 5. Organizacao da Equipe (4-6 pessoas)

### Frente 1: Banco de Dados + Backend (2-3 pessoas)
1. **Fase 1** - Diagramas do banco (ER, relacional) - ja temos os models Django como base
2. **Fase 2** - Serializers e ViewSets para cada app
3. **Fase 3** - Regras de negocio (logica de emprestimo, status, notificacoes)
4. **Fase 4** - Testes

### Frente 2: Frontend (2-3 pessoas)
1. **Fase 1** - Layout base, rotas, componentes de UI (baseado no prototipo Figma)
2. **Fase 2** - Telas de auth (login, cadastro, recuperacao de senha)
3. **Fase 3** - Integracao com a API (fetch, estado, cache)
4. **Fase 4** - Telas de catalogo, detalhe de item, emprestimo

### Cronograma sugerido

| Semana | Frente 1 (Back)                    | Frente 2 (Front)                  |
|--------|------------------------------------|------------------------------------|
| 1-2    | Diagramas ER + revisar models      | Layout base + componentes UI       |
| 3-4    | Serializers + ViewSets CRUD        | Telas auth + integracao login      |
| 5-6    | Regras de negocio (emprestimos)    | Catalogo + busca + filtros         |
| 7-8    | Chat + notificacoes + denuncias    | Chat + perfil + avaliacoes         |
| 9-10   | Testes + ajustes + deploy          | Testes E2E + polish + deploy       |

---

## 6. Como Rodar o Projeto

### Backend

```bash
# 1. Subir o banco PostgreSQL
cd back
docker compose up -d

# 2. Ativar venv e instalar dependencias
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# 3. Rodar migrations
python manage.py migrate

# 4. Criar superuser
python manage.py createsuperuser

# 5. Rodar o servidor
python manage.py runserver
```

### Frontend

```bash
cd front
bun install   # ou npm install
bun dev       # ou npm run dev
```

### URLs uteis (backend)
- Admin: http://localhost:8000/admin/
- API Docs (Swagger): http://localhost:8000/api/docs/
- API Docs (Redoc): http://localhost:8000/api/redoc/

---

## 7. Endpoints da API (resumo)

| Prefixo                    | Descricao                        |
|----------------------------|----------------------------------|
| `/api/auth/`               | Login, logout, refresh token     |
| `/api/auth/registration/`  | Registro de usuario              |
| `/api/auth/social/google/` | Login social Google              |
| `/api/accounts/me/`        | Perfil do usuario logado         |
| `/api/accounts/<id>/`      | Perfil publico de um usuario     |
| `/api/items/`              | CRUD de itens                    |
| `/api/loans/`              | Emprestimos e reservas           |
| `/api/reviews/`            | Avaliacoes                       |
| `/api/notifications/`      | Notificacoes                     |
| `/api/reports/`            | Denuncias                        |
| `/api/chat/`               | Conversas e mensagens            |

---

## 8. Tecnologias

### Backend
- Python 3.14
- Django 6.0
- Django REST Framework 3.16
- SimpleJWT 5.5 (autenticacao JWT)
- dj-rest-auth 7.2 (endpoints de auth prontos)
- django-allauth 65.x (login social OAuth)
- django-cors-headers (CORS com Next.js)
- django-filter (filtros na API)
- drf-spectacular (documentacao OpenAPI/Swagger)
- psycopg2-binary (driver PostgreSQL)
- Pillow (upload de imagens)
- python-decouple (variaveis de ambiente)

### Frontend
- Next.js (configuracao ja existente em `front/`)
- Bun como package manager

### Infraestrutura
- PostgreSQL 18.3 (Docker)
- Docker Compose

---

## 9. Sugestoes e Pontos de Atencao

1. **Geolocalizacao (RF001, RF015)**: Os models ja tem campos lat/lng. Para calcular distancia, usar `django.contrib.gis` (PostGIS) ou calcular no Python com formula Haversine. PostGIS e mais eficiente mas adiciona complexidade. Sugestao: comecar com Haversine no Python e migrar para PostGIS se necessario.

2. **Chat em tempo real (RF019)**: O model de Chat ja esta pronto para HTTP polling. Para tempo real, adicionar Django Channels com WebSocket futuramente.

3. **Notificacoes por email (RF004)**: Configurar um servico de email (SendGrid, Mailgun ou SMTP do Gmail) para enviar notificacoes. Pode ser feito com Celery para nao bloquear a API.

4. **Upload de imagens**: Configurar um servico de storage (S3, Cloudinary) para producao. Em dev, usa o filesystem local.

5. **Sessao de 15min (RNF003)**: O access token JWT ja tem lifetime de 30min. Pode reduzir para 15min no `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` se quiser seguir o requisito ao pe da letra.

6. **Rate limiting (RNF004, RNF005)**: Ja configurado no DRF com throttle de 30 req/min para anonimos e 120 req/min para autenticados.

7. **Categorias pre-populadas**: Criar um management command ou fixture para popular as categorias e subcategorias do prototipo (Ferramentas Eletricas, Manuais, Jardinagem, etc.).
