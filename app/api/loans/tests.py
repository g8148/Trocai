from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
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
        self.reject_url = f'/api/loans/{self.loan.id}/reject/'
        self.cancel_url = f'/api/loans/{self.loan.id}/cancel/'
        self.pickup_url = f'/api/loans/{self.loan.id}/pickup/'
        self.return_url = f'/api/loans/{self.loan.id}/return/'

    def test_create_loan_request_returns_201(self):
        self.client.force_authenticate(user=self.borrower)
        pickup = timezone.now() + timedelta(days=2)
        expected = timezone.now() + timedelta(days=9)
        data = {
            'item': str(self.item_available.id),
            'pickup_date': pickup.isoformat(),
            'expected_return_date': expected.isoformat(),
            'borrower_notes': 'Preciso para reforma',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['borrower']['username'], 'borrower')
        self.assertEqual(response.data['lender']['username'], 'lender')

    def test_create_loan_missing_return_date_returns_400(self):
        self.client.force_authenticate(user=self.borrower)
        pickup = timezone.now() + timedelta(days=2)
        data = {
            'item': str(self.item_available.id),
            'pickup_date': pickup.isoformat(),
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_loan_invalid_dates_returns_400(self):
        self.client.force_authenticate(user=self.borrower)
        pickup = timezone.now() + timedelta(days=9)
        expected = timezone.now() + timedelta(days=2)
        data = {
            'item': str(self.item_available.id),
            'pickup_date': pickup.isoformat(),
            'expected_return_date': expected.isoformat(),
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_loan_past_pickup_date_returns_400(self):
        self.client.force_authenticate(user=self.borrower)
        pickup = timezone.now() - timedelta(days=1)
        expected = timezone.now() + timedelta(days=5)
        data = {
            'item': str(self.item_available.id),
            'pickup_date': pickup.isoformat(),
            'expected_return_date': expected.isoformat(),
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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

    def test_create_loan_own_item_returns_400(self):
        # O dono nao pode solicitar emprestimo do proprio item.
        self.client.force_authenticate(user=self.lender)
        pickup = timezone.now() + timedelta(days=2)
        expected = timezone.now() + timedelta(days=9)
        data = {
            'item': str(self.item_available.id),
            'pickup_date': pickup.isoformat(),
            'expected_return_date': expected.isoformat(),
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Loan.objects.filter(borrower=self.lender).count(), 0)

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

    def test_reject_loan_owner_returns_200(self):
        self.client.force_authenticate(user=self.lender)
        response = self.client.post(self.reject_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.loan.refresh_from_db()
        self.item_available.refresh_from_db()
        self.assertEqual(self.loan.status, 'rejected')
        self.assertEqual(self.item_available.availability, 'available')

    def test_reject_loan_non_owner_returns_403(self):
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(self.reject_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reject_loan_non_pending_returns_400(self):
        self.loan.status = 'approved'
        self.loan.save()
        self.client.force_authenticate(user=self.lender)
        response = self.client.post(self.reject_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_loan_borrower_returns_200(self):
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(self.cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.loan.refresh_from_db()
        self.item_available.refresh_from_db()
        self.assertEqual(self.loan.status, 'cancelled')
        self.assertEqual(self.item_available.availability, 'available')

    def test_cancel_loan_non_borrower_returns_403(self):
        self.client.force_authenticate(user=self.lender)
        response = self.client.post(self.cancel_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cancel_loan_returned_returns_400(self):
        self.loan.status = 'returned'
        self.loan.save()
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(self.cancel_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pickup_loan_borrower_returns_200(self):
        self.loan.status = 'approved'
        self.loan.save()
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(self.pickup_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.loan.refresh_from_db()
        self.assertEqual(self.loan.status, 'in_progress')

    def test_pickup_loan_non_borrower_returns_403(self):
        self.loan.status = 'approved'
        self.loan.save()
        self.client.force_authenticate(user=self.lender)
        response = self.client.post(self.pickup_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_pickup_loan_not_approved_returns_400(self):
        # loan começa em 'pending' no setUp
        self.client.force_authenticate(user=self.borrower)
        response = self.client.post(self.pickup_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_return_item_updates_status(self):
        self.loan.status = 'in_progress'
        self.loan.save()
        self.item_available.availability = 'borrowed'
        self.item_available.save()
        self.client.force_authenticate(user=self.lender)
        response = self.client.post(self.return_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.loan.refresh_from_db()
        self.item_available.refresh_from_db()
        self.assertEqual(self.loan.status, 'returned')
        self.assertIsNotNone(self.loan.actual_return_date)
        self.assertEqual(self.item_available.availability, 'available')
