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
