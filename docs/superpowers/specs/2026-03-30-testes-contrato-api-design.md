# Testes e Contrato de API — Design Spec

**Data:** 2026-03-30
**Autor:** Tech Lead (Hay)

---

## Objetivo

Criar o contrato entre back e front para as 4 features principais do Trocai. O Tech Lead entrega serializers + urls + view stubs + testes dos casos mais complexos. Os colegas do back implementam a lógica nas views para fazer os testes passarem. O front consome via Swagger (`/api/docs/`) e lê os testes como referência de request/response.

---

## Escopo

| App | O que o Tech Lead entrega | O que o colega implementa |
|---|---|---|
| `accounts` | Testes de registro/login/perfil | Nada — views já existem |
| `items` | Serializer + urls + view stubs + testes de CRUD com ownership | Lógica de queryset, filtros, permissões |
| `loans` | Serializer + urls + view stubs + teste de approve 403 | Lógica de status, validação de datas |
| `reviews` | Serializer + urls + view stubs + teste de duplicata | Lógica de criação, validação de loan |

**Fora do escopo agora:** notifications, reports, chat — ficam com views vazias.

---

## Convenção de nomenclatura

Todos os testes seguem o padrão definido no CLAUDE.md:

```
test_<acao>_<condicao>_returns_<status>
```

Exemplos:
- `test_register_valid_data_returns_201`
- `test_update_item_non_owner_returns_403`
- `test_approve_loan_non_owner_returns_403`
- `test_duplicate_review_same_loan_returns_400`

---

## Ferramenta de teste

Django REST Framework `APIClient`. Padrão de setup compartilhado em cada `TestCase`:

```python
from rest_framework.test import APITestCase

class BaseTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='senha123',
            cpf='123.456.789-09',
        )
        self.client.force_authenticate(user=self.user)
```

`force_authenticate` simula o JWT sem precisar fazer o fluxo de login — correto para testes unitários de endpoint.

---

## App: accounts

### Endpoints
```
POST /api/auth/registration/  — registro de novo usuário
POST /api/auth/login/         — login (retorna access + refresh)
GET  /api/accounts/me/        — perfil do usuário autenticado
```

### Testes a implementar
| Teste | Descrição |
|---|---|
| `test_register_valid_data_returns_201` | Payload completo (username, email, cpf, password1, password2) → 201 |
| `test_register_duplicate_cpf_returns_400` | CPF já cadastrado → 400 |
| `test_register_duplicate_email_returns_400` | Email já cadastrado → 400 |
| `test_login_valid_credentials_returns_tokens` | Credenciais corretas → 200 com `access` e `refresh` |
| `test_login_invalid_credentials_returns_401` | Senha errada → 401 |
| `test_get_profile_authenticated_returns_200` | Token válido → 200 com campos do UserDetailSerializer |
| `test_get_profile_unauthenticated_returns_401` | Sem token → 401 |

### Payload de registro (contrato de entrada)
```json
{
  "username": "joao",
  "email": "joao@email.com",
  "cpf": "123.456.789-09",
  "first_name": "João",
  "last_name": "Silva",
  "password1": "senha_segura123",
  "password2": "senha_segura123"
}
```

### Resposta de perfil (contrato de saída — UserDetailSerializer)
```json
{
  "id": "uuid",
  "username": "joao",
  "email": "joao@email.com",
  "first_name": "João",
  "last_name": "Silva",
  "cpf": "123.456.789-09",
  "phone": "",
  "avatar": null,
  "zip_code": "",
  "street": "",
  "neighborhood": "",
  "city": "",
  "state": "",
  "latitude": null,
  "longitude": null,
  "search_radius_km": 5,
  "status": "available",
  "email_verified": false,
  "phone_verified": false,
  "created_at": "2026-03-30T...",
  "updated_at": "2026-03-30T..."
}
```

---

## App: items

### Endpoints
```
GET    /api/items/      — lista paginada (público autenticado)
POST   /api/items/      — cria item (autenticado)
GET    /api/items/:id/  — detalhe do item
PATCH  /api/items/:id/  — atualiza (apenas dono)
DELETE /api/items/:id/  — deleta (apenas dono)
```

### Serializer (contrato de dados)
Campos expostos pelo `ItemSerializer`:
```
id, name, description, owner (id + username), subcategory,
segregation, condition, estimated_value, availability,
allow_reservation, is_active, times_borrowed,
images (lista de URLs), created_at, updated_at
```
`owner` é read-only (setado automaticamente na view como `request.user`).

### View stubs
```python
class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    # TODO: queryset, perform_create, filtros por categoria/disponibilidade

class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    # TODO: queryset, IsOwnerOrReadOnly permission
```

### Testes a implementar (os mais ricos — padrão para o time replicar)
| Teste | Ensina |
|---|---|
| `test_create_item_authenticated_returns_201` | POST com token, owner setado automaticamente |
| `test_create_item_unauthenticated_returns_401` | Proteção de endpoint |
| `test_list_items_returns_200` | Paginação — resposta tem `count`, `results` |
| `test_update_item_owner_returns_200` | PATCH do dono → 200 |
| `test_update_item_non_owner_returns_403` | **Padrão ownership** — 403 para quem não é dono |
| `test_delete_item_owner_returns_204` | DELETE → 204 sem body |

### Payload de criação (contrato de entrada)
```json
{
  "name": "Furadeira Bosch",
  "description": "Furadeira de impacto 600W",
  "subcategory": "uuid-da-subcategoria",
  "segregation": "hobby",
  "condition": "good",
  "estimated_value": "150.00",
  "allow_reservation": true
}
```

---

## App: loans

### Endpoints
```
GET  /api/loans/              — lista empréstimos do usuário
POST /api/loans/              — solicita empréstimo
GET  /api/loans/:id/          — detalhe
POST /api/loans/:id/approve/  — aprova (apenas dono do item)
POST /api/loans/:id/return/   — registra devolução
```

### Serializer (contrato de dados)
Campos expostos pelo `LoanSerializer`:
```
id, item (id + name), borrower (id + username), lender (id + username),
status, pickup_date, expected_return_date, actual_return_date,
borrower_notes, lender_notes, requested_at, updated_at
```
`lender` é read-only (setado como `item.owner` na view).

### View stubs
```python
class LoanListCreateView(generics.ListCreateAPIView):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]
    # TODO: queryset filtra por borrower ou lender, perform_create seta lender e valida disponibilidade

class LoanDetailView(generics.RetrieveAPIView):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]
    # TODO: queryset

class LoanApproveView(APIView):
    permission_classes = [IsAuthenticated]
    # TODO: verifica se request.user == loan.lender, muda status para approved

class LoanReturnView(APIView):
    permission_classes = [IsAuthenticated]
    # TODO: verifica se request.user == loan.lender, seta actual_return_date e status returned
```

### Testes a implementar
| Teste | Ensina |
|---|---|
| `test_create_loan_request_returns_201` | POST com item disponível → 201 |
| `test_create_loan_unavailable_item_returns_400` | Item com availability != disponivel → 400 |
| `test_approve_loan_owner_returns_200` | Dono do item aprova → 200, status vira `approved` |
| `test_approve_loan_non_owner_returns_403` | **Padrão ownership contextual** — 403 para quem não é o lender |

### Payload de solicitação (contrato de entrada)
```json
{
  "item": "uuid-do-item",
  "pickup_date": "2026-04-10",
  "expected_return_date": "2026-04-20",
  "borrower_notes": "Preciso para reforma do banheiro"
}
```

---

## App: reviews

### Endpoints
```
POST /api/reviews/  — cria avaliação (após empréstimo devolvido)
GET  /api/reviews/  — lista avaliações
```

### Serializer (contrato de dados)
Campos expostos pelo `ReviewSerializer`:
```
id, loan (id), reviewer (id + username), reviewed_user (id + username),
item_rating, user_rating, description, image, created_at
```
`reviewer` é read-only (setado como `request.user`).
`reviewed_user` é read-only (inferido do loan — se o reviewer é o borrower, reviewed é o lender, e vice-versa).

### View stubs
```python
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    # TODO: perform_create seta reviewer e reviewed_user, valida que loan.status == returned
```

### Testes a implementar
| Teste | Ensina |
|---|---|
| `test_create_review_after_loan_returns_201` | Review válida após loan devolvido → 201 |
| `test_create_review_without_completed_loan_returns_400` | Loan não devolvido → 400 |
| `test_duplicate_review_same_loan_returns_400` | **unique_together** — segunda review no mesmo loan → 400 |

### Payload de criação (contrato de entrada)
```json
{
  "loan": "uuid-do-loan",
  "item_rating": 5,
  "user_rating": 4,
  "description": "Ótima furadeira, chegou no prazo combinado."
}
```

---

## O que o colega do back precisa implementar

Para cada view stub, o colega precisa adicionar:

1. **`queryset`** — quais objetos são retornados e com quais filtros
2. **`perform_create`** — lógica ao criar (setar owner, validar disponibilidade, etc.)
3. **Permissões customizadas** — `IsOwnerOrReadOnly` para items, ownership contextual para loans
4. **Validações de negócio** — item disponível para loan, loan devolvido para review

O padrão está documentado nos testes: se o teste `test_update_item_non_owner_returns_403` passar, a permissão está correta.

---

## Como o front usa isso

1. **Swagger UI** em `/api/docs/` — gerado automaticamente dos serializers. Mostra todos os campos, tipos e endpoints.
2. **Testes como referência** — cada teste mostra exatamente o payload de entrada e o status/campos esperados na saída.
3. **Mocks iniciais** — o front pode mockar com os shapes documentados aqui enquanto o back implementa as views.
