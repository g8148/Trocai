# Testes e Contrato de API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar serializers, view stubs, URLs e testes que definem o contrato de API entre back e front para accounts, items, loans e reviews.

**Architecture:** O Tech Lead escreve os serializers (shape dos dados), urls, view stubs (sem lógica de negócio) e os testes mais complexos. Os colegas do back implementam a lógica dentro das views para fazer os testes passarem. O front consome via Swagger em `/api/docs/`.

**Tech Stack:** Django 6, Django REST Framework 3.16, SimpleJWT, dj-rest-auth, APITestCase (DRF)

---

## Arquivos modificados / criados

| Arquivo | Ação |
|---|---|
| `app/api/accounts/serializers.py` | Modificar: adicionar `validate_cpf` ao `CustomRegisterSerializer` |
| `app/api/accounts/tests.py` | Modificar: escrever 7 testes |
| `app/api/items/serializers.py` | Criar |
| `app/api/items/urls.py` | Modificar: adicionar rotas |
| `app/api/items/views.py` | Modificar: adicionar view stubs |
| `app/api/items/tests.py` | Modificar: escrever 6 testes |
| `app/api/loans/serializers.py` | Criar |
| `app/api/loans/urls.py` | Modificar: adicionar rotas |
| `app/api/loans/views.py` | Modificar: adicionar view stubs |
| `app/api/loans/tests.py` | Modificar: escrever 4 testes |
| `app/api/reviews/serializers.py` | Criar |
| `app/api/reviews/urls.py` | Modificar: adicionar rotas |
| `app/api/reviews/views.py` | Modificar: adicionar view stubs |
| `app/api/reviews/tests.py` | Modificar: escrever 3 testes |

---

## Comando para rodar os testes

```bash
cd app/api && .venv/bin/python manage.py test accounts items loans reviews -v 2
```

---

## Task 1: accounts — validação de CPF único + testes

**Files:**
- Modify: `app/api/accounts/serializers.py`
- Modify: `app/api/accounts/tests.py`

O `CustomRegisterSerializer` não valida unicidade do CPF automaticamente (não é um ModelSerializer). Precisamos adicionar `validate_cpf` para o teste de duplicata funcionar.

- [ ] **Step 1: Adicionar `validate_cpf` ao `CustomRegisterSerializer`**

Em `app/api/accounts/serializers.py`, adicionar o método dentro de `CustomRegisterSerializer`, antes do `get_cleaned_data`:

```python
def validate_cpf(self, value):
    from .models import User
    if User.objects.filter(cpf=value).exists():
        raise serializers.ValidationError("CPF já cadastrado.")
    return value
```

- [ ] **Step 2: Escrever os testes de accounts**

Substituir o conteúdo de `app/api/accounts/tests.py`:

```python
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AccountsTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='existing',
            email='existing@test.com',
            password='senha123',
            cpf='777.777.777-77',
        )
        self.register_url = '/api/auth/registration/'
        self.login_url = '/api/auth/login/'
        self.me_url = '/api/accounts/me/'

    def test_register_valid_data_returns_201(self):
        data = {
            'username': 'novousuario',
            'email': 'novo@test.com',
            'cpf': '123.456.789-09',
            'first_name': 'Novo',
            'last_name': 'Usuario',
            'password1': 'senha_segura_123',
            'password2': 'senha_segura_123',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_duplicate_cpf_returns_400(self):
        data = {
            'username': 'outro',
            'email': 'outro@test.com',
            'cpf': '777.777.777-77',  # CPF já cadastrado no setUp
            'first_name': 'Outro',
            'last_name': 'Usuario',
            'password1': 'senha_segura_123',
            'password2': 'senha_segura_123',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_returns_400(self):
        data = {
            'username': 'outro2',
            'email': 'existing@test.com',  # email já cadastrado no setUp
            'cpf': '888.888.888-88',
            'first_name': 'Outro',
            'last_name': 'Usuario',
            'password1': 'senha_segura_123',
            'password2': 'senha_segura_123',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_valid_credentials_returns_tokens(self):
        data = {'username': 'existing', 'password': 'senha123'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials_returns_400(self):
        # dj-rest-auth retorna 400 (ValidationError) para credenciais inválidas
        data = {'username': 'existing', 'password': 'senha_errada'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_profile_authenticated_returns_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existing')
        self.assertIn('cpf', response.data)
        self.assertIn('email_verified', response.data)

    def test_get_profile_unauthenticated_returns_401(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

- [ ] **Step 3: Rodar os testes de accounts**

```bash
cd app/api && .venv/bin/python manage.py test accounts -v 2
```

Expected: 7 testes passando. Se algum falhar, verificar configuração do allauth/dj-rest-auth.

- [ ] **Step 4: Commit**

```bash
git add app/api/accounts/serializers.py app/api/accounts/tests.py
git commit -m "test(accounts): adiciona testes de registro, login e perfil"
```

---

## Task 2: items — serializer, URLs e view stubs

**Files:**
- Create: `app/api/items/serializers.py`
- Modify: `app/api/items/urls.py`
- Modify: `app/api/items/views.py`

- [ ] **Step 1: Criar `app/api/items/serializers.py`**

```python
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Item, ItemImage

User = get_user_model()


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'is_cover']


class ItemSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'owner', 'subcategory',
            'segregation', 'condition', 'estimated_value', 'availability',
            'allow_reservation', 'is_active', 'times_borrowed',
            'images', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'owner', 'availability', 'times_borrowed',
            'is_active', 'created_at', 'updated_at',
        ]
```

- [ ] **Step 2: Atualizar `app/api/items/urls.py`**

```python
from django.urls import path

from . import views

app_name = "items"

urlpatterns = [
    path('', views.ItemListCreateView.as_view(), name='item-list'),
    path('<uuid:pk>/', views.ItemDetailView.as_view(), name='item-detail'),
]
```

- [ ] **Step 3: Atualizar `app/api/items/views.py`**

```python
from rest_framework import generics, permissions

from .models import Item
from .serializers import ItemSerializer


class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        # TODO: implementar notificações e lógica de disponibilidade


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.filter(is_active=True)
    # TODO: implementar IsOwnerOrReadOnly — só o dono pode editar/deletar
```

- [ ] **Step 4: Verificar que o Django reconhece as views**

```bash
cd app/api && .venv/bin/python manage.py check items
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 5: Commit**

```bash
git add app/api/items/serializers.py app/api/items/urls.py app/api/items/views.py
git commit -m "feat(items): adiciona serializer, urls e view stubs"
```

---

## Task 3: items — testes

**Files:**
- Modify: `app/api/items/tests.py`

- [ ] **Step 1: Escrever os testes de items**

Substituir o conteúdo de `app/api/items/tests.py`:

```python
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from items.models import Category, Item, SubCategory

User = get_user_model()


class ItemTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username='owner',
            email='owner@test.com',
            password='senha123',
            cpf='111.111.111-11',
        )
        self.user2 = User.objects.create_user(
            username='outro',
            email='outro@test.com',
            password='senha123',
            cpf='222.222.222-22',
        )
        category = Category.objects.create(name='Ferramentas', type='tool')
        self.subcategory = SubCategory.objects.create(
            category=category, name='Elétricas'
        )
        self.item = Item.objects.create(
            owner=self.user1,
            name='Furadeira',
            description='Furadeira de impacto 600W',
            subcategory=self.subcategory,
        )
        self.list_url = '/api/items/'
        self.detail_url = f'/api/items/{self.item.id}/'

    def test_list_items_returns_200(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)  # resposta paginada

    def test_create_item_authenticated_returns_201(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            'name': 'Serra Circular',
            'description': 'Serra de bancada 1200W',
            'subcategory': str(self.subcategory.id),
            'segregation': 'hobby',
            'condition': 'good',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Serra Circular')
        self.assertEqual(response.data['owner']['username'], 'owner')

    def test_create_item_unauthenticated_returns_401(self):
        data = {'name': 'Serra', 'description': 'Desc'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_item_owner_returns_200(self):
        # Requer: colega implementa IsOwnerOrReadOnly na ItemDetailView
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(
            self.detail_url, {'name': 'Furadeira Atualizada'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Furadeira Atualizada')

    def test_update_item_non_owner_returns_403(self):
        # Requer: colega implementa IsOwnerOrReadOnly na ItemDetailView
        self.client.force_authenticate(user=self.user2)
        response = self.client.patch(
            self.detail_url, {'name': 'Hack'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_item_owner_returns_204(self):
        # Requer: colega implementa IsOwnerOrReadOnly na ItemDetailView
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
```

- [ ] **Step 2: Rodar os testes de items**

```bash
cd app/api && .venv/bin/python manage.py test items -v 2
```

Expected:
- `test_list_items_returns_200` → PASS
- `test_create_item_authenticated_returns_201` → PASS
- `test_create_item_unauthenticated_returns_401` → PASS
- `test_update_item_owner_returns_200` → FAIL (view stub sem IsOwnerOrReadOnly)
- `test_update_item_non_owner_returns_403` → FAIL (view stub sem IsOwnerOrReadOnly)
- `test_delete_item_owner_returns_204` → FAIL (view stub sem IsOwnerOrReadOnly)

Os 3 FAIL são esperados — documentam o que o colega precisa implementar.

- [ ] **Step 3: Commit**

```bash
git add app/api/items/tests.py
git commit -m "test(items): adiciona testes de CRUD com contrato de ownership"
```

---

## Task 4: loans — serializer, URLs e view stubs

**Files:**
- Create: `app/api/loans/serializers.py`
- Modify: `app/api/loans/urls.py`
- Modify: `app/api/loans/views.py`

- [ ] **Step 1: Criar `app/api/loans/serializers.py`**

```python
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Loan

User = get_user_model()


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class LoanSerializer(serializers.ModelSerializer):
    borrower = ParticipantSerializer(read_only=True)
    lender = ParticipantSerializer(read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'item', 'borrower', 'lender', 'status',
            'pickup_date', 'expected_return_date', 'actual_return_date',
            'borrower_notes', 'lender_notes', 'requested_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'borrower', 'lender', 'status',
            'actual_return_date', 'requested_at', 'updated_at',
        ]
```

- [ ] **Step 2: Atualizar `app/api/loans/urls.py`**

```python
from django.urls import path

from . import views

app_name = "loans"

urlpatterns = [
    path('', views.LoanListCreateView.as_view(), name='loan-list'),
    path('<uuid:pk>/', views.LoanDetailView.as_view(), name='loan-detail'),
    path('<uuid:pk>/approve/', views.LoanApproveView.as_view(), name='loan-approve'),
    path('<uuid:pk>/return/', views.LoanReturnView.as_view(), name='loan-return'),
]
```

- [ ] **Step 3: Atualizar `app/api/loans/views.py`**

```python
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Loan
from .serializers import LoanSerializer


class LoanListCreateView(generics.ListCreateAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()

    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        serializer.save(borrower=self.request.user, lender=item.owner)
        # TODO: validar item.availability == 'available', mudar para 'reserved'


class LoanDetailView(generics.RetrieveAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()


class LoanApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # TODO: verificar request.user == loan.lender → 403 se não
        # TODO: mudar loan.status para 'approved'
        # TODO: mudar item.availability para 'borrowed'
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


class LoanReturnView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # TODO: verificar request.user == loan.lender → 403 se não
        # TODO: setar actual_return_date = now(), status = 'returned'
        # TODO: mudar item.availability para 'available'
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
```

- [ ] **Step 4: Verificar sintaxe**

```bash
cd app/api && .venv/bin/python manage.py check loans
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 5: Commit**

```bash
git add app/api/loans/serializers.py app/api/loans/urls.py app/api/loans/views.py
git commit -m "feat(loans): adiciona serializer, urls e view stubs"
```

---

## Task 5: loans — testes

**Files:**
- Modify: `app/api/loans/tests.py`

- [ ] **Step 1: Escrever os testes de loans**

Substituir o conteúdo de `app/api/loans/tests.py`:

```python
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from items.models import Category, Item
from loans.models import Loan

User = get_user_model()


class LoanTests(APITestCase):

    def setUp(self):
        self.lender = User.objects.create_user(
            username='lender',
            email='lender@test.com',
            password='senha123',
            cpf='333.333.333-33',
        )
        self.borrower = User.objects.create_user(
            username='borrower',
            email='borrower@test.com',
            password='senha123',
            cpf='444.444.444-44',
        )
        Category.objects.create(name='Ferramentas', type='tool')
        self.item_available = Item.objects.create(
            owner=self.lender,
            name='Furadeira',
            description='Furadeira de impacto',
            availability='available',
        )
        self.item_unavailable = Item.objects.create(
            owner=self.lender,
            name='Serra',
            description='Serra emprestada',
            availability='borrowed',
        )
        self.loan = Loan.objects.create(
            item=self.item_available,
            borrower=self.borrower,
            lender=self.lender,
            status='pending',
            pickup_date='2026-04-10T10:00:00Z',
            expected_return_date='2026-04-20T10:00:00Z',
        )
        self.list_url = '/api/loans/'
        self.approve_url = f'/api/loans/{self.loan.id}/approve/'

    def test_create_loan_request_returns_201(self):
        self.client.force_authenticate(user=self.borrower)
        data = {
            'item': str(self.item_available.id),
            'pickup_date': '2026-05-01T10:00:00Z',
            'expected_return_date': '2026-05-10T10:00:00Z',
            'borrower_notes': 'Preciso para reforma',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['borrower']['username'], 'borrower')
        self.assertEqual(response.data['lender']['username'], 'lender')

    def test_create_loan_unavailable_item_returns_400(self):
        # Requer: colega valida item.availability == 'available' no perform_create
        self.client.force_authenticate(user=self.borrower)
        data = {
            'item': str(self.item_unavailable.id),
            'pickup_date': '2026-05-01T10:00:00Z',
            'expected_return_date': '2026-05-10T10:00:00Z',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_loan_owner_returns_200(self):
        # Requer: colega implementa LoanApproveView (stub retorna 501)
        self.client.force_authenticate(user=self.lender)
        response = self.client.post(self.approve_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.loan.refresh_from_db()
        self.assertEqual(self.loan.status, 'approved')

    def test_approve_loan_non_owner_returns_403(self):
        # Requer: colega implementa LoanApproveView (stub retorna 501)
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(self.approve_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
```

- [ ] **Step 2: Rodar os testes de loans**

```bash
cd app/api && .venv/bin/python manage.py test loans -v 2
```

Expected:
- `test_create_loan_request_returns_201` → PASS
- `test_create_loan_unavailable_item_returns_400` → FAIL (stub sem validação)
- `test_approve_loan_owner_returns_200` → FAIL (stub retorna 501)
- `test_approve_loan_non_owner_returns_403` → FAIL (stub retorna 501)

Os 3 FAIL documentam exatamente o que o colega precisa implementar.

- [ ] **Step 3: Commit**

```bash
git add app/api/loans/tests.py
git commit -m "test(loans): adiciona testes de criação e aprovação de empréstimo"
```

---

## Task 6: reviews — serializer, URLs e view stubs

**Files:**
- Create: `app/api/reviews/serializers.py`
- Modify: `app/api/reviews/urls.py`
- Modify: `app/api/reviews/views.py`

- [ ] **Step 1: Criar `app/api/reviews/serializers.py`**

```python
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Review

User = get_user_model()


class ReviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = ReviewerSerializer(read_only=True)
    reviewed_user = ReviewerSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'loan', 'reviewer', 'reviewed_user',
            'item_rating', 'user_rating', 'description',
            'image', 'created_at',
        ]
        read_only_fields = ['id', 'reviewer', 'reviewed_user', 'created_at']
```

- [ ] **Step 2: Atualizar `app/api/reviews/urls.py`**

```python
from django.urls import path

from . import views

app_name = "reviews"

urlpatterns = [
    path('', views.ReviewListCreateView.as_view(), name='review-list'),
]
```

- [ ] **Step 3: Atualizar `app/api/reviews/views.py`**

```python
from rest_framework import generics, permissions

from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()

    def perform_create(self, serializer):
        loan = serializer.validated_data['loan']
        reviewed_user = (
            loan.lender if self.request.user == loan.borrower else loan.borrower
        )
        serializer.save(reviewer=self.request.user, reviewed_user=reviewed_user)
        # TODO: validar loan.status == 'returned' antes de criar → raise ValidationError
```

- [ ] **Step 4: Verificar sintaxe**

```bash
cd app/api && .venv/bin/python manage.py check reviews
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 5: Commit**

```bash
git add app/api/reviews/serializers.py app/api/reviews/urls.py app/api/reviews/views.py
git commit -m "feat(reviews): adiciona serializer, urls e view stub"
```

---

## Task 7: reviews — testes

**Files:**
- Modify: `app/api/reviews/tests.py`

- [ ] **Step 1: Escrever os testes de reviews**

Substituir o conteúdo de `app/api/reviews/tests.py`:

```python
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from items.models import Category, Item
from loans.models import Loan
from reviews.models import Review

User = get_user_model()


class ReviewTests(APITestCase):

    def setUp(self):
        self.lender = User.objects.create_user(
            username='lender_r',
            email='lender_r@test.com',
            password='senha123',
            cpf='555.555.555-55',
        )
        self.borrower = User.objects.create_user(
            username='borrower_r',
            email='borrower_r@test.com',
            password='senha123',
            cpf='666.666.666-66',
        )
        Category.objects.create(name='Ferramentas R', type='tool')
        self.item = Item.objects.create(
            owner=self.lender,
            name='Furadeira R',
            description='Furadeira',
        )
        self.loan_returned = Loan.objects.create(
            item=self.item,
            borrower=self.borrower,
            lender=self.lender,
            status='returned',
            pickup_date='2026-03-01T10:00:00Z',
            expected_return_date='2026-03-10T10:00:00Z',
        )
        self.loan_pending = Loan.objects.create(
            item=self.item,
            borrower=self.borrower,
            lender=self.lender,
            status='pending',
            pickup_date='2026-04-01T10:00:00Z',
            expected_return_date='2026-04-10T10:00:00Z',
        )
        self.list_url = '/api/reviews/'

    def test_create_review_after_loan_returns_201(self):
        self.client.force_authenticate(user=self.borrower)
        data = {
            'loan': str(self.loan_returned.id),
            'item_rating': 5,
            'user_rating': 4,
            'description': 'Ótima furadeira, chegou no prazo!',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['item_rating'], 5)
        self.assertEqual(response.data['reviewer']['username'], 'borrower_r')
        self.assertEqual(response.data['reviewed_user']['username'], 'lender_r')

    def test_create_review_without_completed_loan_returns_400(self):
        # Requer: colega valida loan.status == 'returned' no perform_create
        self.client.force_authenticate(user=self.borrower)
        data = {
            'loan': str(self.loan_pending.id),
            'item_rating': 5,
            'user_rating': 4,
            'description': 'Review prematura',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_review_same_loan_returns_400(self):
        # unique_together = ['loan', 'reviewer'] no model — DRF valida automaticamente
        Review.objects.create(
            loan=self.loan_returned,
            reviewer=self.borrower,
            reviewed_user=self.lender,
            item_rating=5,
            user_rating=4,
        )
        self.client.force_authenticate(user=self.borrower)
        data = {
            'loan': str(self.loan_returned.id),
            'item_rating': 3,
            'user_rating': 3,
            'description': 'Segunda tentativa',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
```

- [ ] **Step 2: Rodar os testes de reviews**

```bash
cd app/api && .venv/bin/python manage.py test reviews -v 2
```

Expected:
- `test_create_review_after_loan_returns_201` → PASS
- `test_duplicate_review_same_loan_returns_400` → PASS (unique_together é validado pelo DRF)
- `test_create_review_without_completed_loan_returns_400` → FAIL (stub sem validação de status)

- [ ] **Step 3: Commit**

```bash
git add app/api/reviews/tests.py
git commit -m "test(reviews): adiciona testes de criação e duplicata de avaliação"
```

---

## Task 8: rodar suite completa e verificar

- [ ] **Step 1: Rodar todos os testes**

```bash
cd app/api && .venv/bin/python manage.py test accounts items loans reviews -v 2
```

Expected summary — testes que passam com os stubs:
- accounts: **7/7 PASS**
- items: **3/6 PASS** (falham: update_owner, update_non_owner, delete_owner)
- loans: **1/4 PASS** (falham: unavailable_item, approve_owner, approve_non_owner)
- reviews: **2/3 PASS** (falha: without_completed_loan)

Total esperado: **13 PASS, 7 FAIL** — os 7 FAIL são o backlog do colega do back.

- [ ] **Step 2: Commit final com o plano**

```bash
git add docs/superpowers/plans/2026-03-30-testes-contrato-api.md
git commit -m "docs: adiciona plano de implementação dos testes de contrato"
```

---

## Resumo para o colega do back

Para fazer cada teste FAIL virar PASS:

| Teste falhando | O que implementar |
|---|---|
| `test_update_item_owner_returns_200` | `IsOwnerOrReadOnly` permission na `ItemDetailView` |
| `test_update_item_non_owner_returns_403` | `IsOwnerOrReadOnly` permission na `ItemDetailView` |
| `test_delete_item_owner_returns_204` | `IsOwnerOrReadOnly` permission na `ItemDetailView` |
| `test_create_loan_unavailable_item_returns_400` | Validação de `item.availability` no `perform_create` da `LoanListCreateView` |
| `test_approve_loan_owner_returns_200` | Implementar `LoanApproveView.post()` com check de ownership |
| `test_approve_loan_non_owner_returns_403` | Implementar `LoanApproveView.post()` com check de ownership |
| `test_create_review_without_completed_loan_returns_400` | Validação de `loan.status == 'returned'` no `perform_create` da `ReviewListCreateView` |
