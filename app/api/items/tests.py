import io
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from items.models import Category, Item, SubCategory

User = get_user_model()


def _make_image_file(name="foto.png"):
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="PNG")
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="image/png")


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


_TEMP_MEDIA = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=_TEMP_MEDIA)
class ItemImageUploadTests(APITestCase):

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(_TEMP_MEDIA, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.user = User.objects.create_user(
            username='dono',
            email='dono@test.com',
            password='senha123',
            cpf='333.333.333-33',
        )
        self.upload_url = '/api/items/images/upload/'

    def test_upload_image_authenticated_returns_201(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.upload_url,
            {'file': _make_image_file()},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', response.data)
        # URL absoluta para passar na validacao de image_urls do ItemSerializer
        self.assertTrue(response.data['url'].startswith('http'))
        self.assertIn('/media/', response.data['url'])

    def test_upload_image_unauthenticated_returns_401(self):
        response = self.client.post(
            self.upload_url,
            {'file': _make_image_file()},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_non_image_returns_400(self):
        self.client.force_authenticate(user=self.user)
        not_an_image = SimpleUploadedFile(
            'arquivo.txt', b'isto nao e uma imagem', content_type='text/plain'
        )
        response = self.client.post(
            self.upload_url,
            {'file': not_an_image},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ItemRatingAggregateTests(APITestCase):

    def setUp(self):
        from loans.models import Loan
        from reviews.models import Review

        self.lender = User.objects.create_user(
            username='lr', email='lr@test.com', password='senha123', cpf='121.121.121-21',
        )
        self.borrower = User.objects.create_user(
            username='br', email='br@test.com', password='senha123', cpf='131.131.131-31',
        )
        self.item = Item.objects.create(owner=self.lender, name='Plaina', description='x')
        loan = Loan.objects.create(
            item=self.item, borrower=self.borrower, lender=self.lender, status='returned',
            pickup_date='2026-03-01T10:00:00Z', expected_return_date='2026-03-10T10:00:00Z',
        )
        Review.objects.create(
            loan=loan, reviewer=self.borrower, reviewed_user=self.lender,
            item_rating=4, user_rating=5,
        )
        Review.objects.create(
            loan=loan, reviewer=self.lender, reviewed_user=self.borrower,
            item_rating=2, user_rating=5,
        )

    def test_item_detail_exposes_average_rating_and_count(self):
        self.client.force_authenticate(user=self.borrower)
        response = self.client.get(f'/api/items/{self.item.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['average_rating'], 3.0)
        self.assertEqual(response.data['review_count'], 2)

    def test_item_without_reviews_has_null_rating(self):
        item2 = Item.objects.create(owner=self.lender, name='Lixadeira', description='x')
        self.client.force_authenticate(user=self.borrower)
        response = self.client.get(f'/api/items/{item2.id}/')
        self.assertIsNone(response.data['average_rating'])
        self.assertEqual(response.data['review_count'], 0)
