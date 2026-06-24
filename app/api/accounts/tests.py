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


class MeAverageRatingTests(APITestCase):

    def test_me_exposes_average_rating(self):
        from items.models import Category, Item
        from loans.models import Loan
        from reviews.models import Review

        lender = User.objects.create_user(
            username='lm', email='lm@test.com', password='senha123', cpf='141.141.141-41',
        )
        borrower = User.objects.create_user(
            username='bm', email='bm@test.com', password='senha123', cpf='151.151.151-51',
        )
        Category.objects.create(name='Cat M', type='tool')
        item = Item.objects.create(owner=lender, name='Item M', description='x')
        loan = Loan.objects.create(
            item=item, borrower=borrower, lender=lender, status='returned',
            pickup_date='2026-03-01T10:00:00Z', expected_return_date='2026-03-10T10:00:00Z',
        )
        Review.objects.create(
            loan=loan, reviewer=borrower, reviewed_user=lender,
            item_rating=4, user_rating=5,
        )
        self.client.force_authenticate(user=lender)
        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['average_rating'], 5.0)
