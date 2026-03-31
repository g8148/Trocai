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
