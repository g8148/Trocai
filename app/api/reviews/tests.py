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

    def test_create_review_non_participant_returns_400(self):
        outsider = User.objects.create_user(
            username='outsider', email='out@test.com', password='senha123', cpf='999.999.999-99',
        )
        self.client.force_authenticate(user=outsider)
        data = {'loan': str(self.loan_returned.id), 'item_rating': 5, 'user_rating': 5}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_review_both_parties_returns_201(self):
        # borrower avalia
        self.client.force_authenticate(user=self.borrower)
        r1 = self.client.post(
            self.list_url,
            {'loan': str(self.loan_returned.id), 'item_rating': 5, 'user_rating': 4},
            format='json',
        )
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        # lender tambem avalia o mesmo emprestimo
        self.client.force_authenticate(user=self.lender)
        r2 = self.client.post(
            self.list_url,
            {'loan': str(self.loan_returned.id), 'item_rating': 3, 'user_rating': 5},
            format='json',
        )
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r2.data['reviewed_user']['username'], 'borrower_r')

    def test_create_review_invalid_rating_returns_400(self):
        self.client.force_authenticate(user=self.borrower)
        data = {'loan': str(self.loan_returned.id), 'item_rating': 9, 'user_rating': 4}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_review_after_soft_delete_returns_400_not_500(self):
        Review.objects.create(
            loan=self.loan_returned, reviewer=self.borrower, reviewed_user=self.lender,
            item_rating=5, user_rating=4, is_deleted=True,
        )
        self.client.force_authenticate(user=self.borrower)
        data = {'loan': str(self.loan_returned.id), 'item_rating': 3, 'user_rating': 3}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReviewListFilterTests(APITestCase):

    def setUp(self):
        self.lender = User.objects.create_user(
            username='lf', email='lf@test.com', password='senha123', cpf='777.777.777-77',
        )
        self.borrower = User.objects.create_user(
            username='bf', email='bf@test.com', password='senha123', cpf='888.888.888-88',
        )
        Category.objects.create(name='Ferramentas F', type='tool')
        self.item = Item.objects.create(owner=self.lender, name='Serra F', description='x')
        self.loan = Loan.objects.create(
            item=self.item, borrower=self.borrower, lender=self.lender, status='returned',
            pickup_date='2026-03-01T10:00:00Z', expected_return_date='2026-03-10T10:00:00Z',
        )
        Review.objects.create(
            loan=self.loan, reviewer=self.borrower, reviewed_user=self.lender,
            item_rating=5, user_rating=4,
        )
        # Segunda avaliacao, de outro item/usuario, para o filtro discriminar de verdade
        self.other_item = Item.objects.create(owner=self.borrower, name='Outro F', description='x')
        self.other_loan = Loan.objects.create(
            item=self.other_item, borrower=self.lender, lender=self.borrower, status='returned',
            pickup_date='2026-03-01T10:00:00Z', expected_return_date='2026-03-10T10:00:00Z',
        )
        Review.objects.create(
            loan=self.other_loan, reviewer=self.lender, reviewed_user=self.borrower,
            item_rating=3, user_rating=2,
        )
        self.list_url = '/api/reviews/'

    def test_list_reviews_filtered_by_item_returns_only_that_item(self):
        self.client.force_authenticate(user=self.borrower)
        response = self.client.get(f'{self.list_url}?item={self.item.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)

    def test_list_reviews_filtered_by_reviewed_user_returns_received(self):
        self.client.force_authenticate(user=self.lender)
        response = self.client.get(f'{self.list_url}?reviewed_user={self.lender.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['reviewed_user']['username'], 'lf')
