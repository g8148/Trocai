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
