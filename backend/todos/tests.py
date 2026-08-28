from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Account

from .models import Todo


class TodoApiTests(APITestCase):
    def setUp(self):
        self.account = Account.objects.create(auth0_user_id="auth0|owner", email="owner@example.com")
        self.other_account = Account.objects.create(auth0_user_id="auth0|other")
        self.todo = Todo.objects.create(account=self.account, title="My task")
        self.other_todo = Todo.objects.create(account=self.other_account, title="Private task")

    def authenticate(self):
        self.client.force_authenticate(user=self.account)

    def test_todo_list_requires_authentication(self):
        response = self.client.get(reverse("todo-list"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_only_contains_the_authenticated_accounts_todos(self):
        self.authenticate()
        response = self.client.get(reverse("todo-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [self.todo.id])

    def test_create_assigns_ownership_from_the_authenticated_account(self):
        self.authenticate()
        response = self.client.post(
            reverse("todo-list"),
            {"title": "New task", "description": "A useful detail", "completed": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = Todo.objects.get(id=response.data["id"])
        self.assertEqual(created.account, self.account)

    def test_another_accounts_todo_is_hidden_for_every_detail_action(self):
        self.authenticate()
        url = reverse("todo-detail", args=[self.other_todo.id])
        responses = [
            self.client.get(url),
            self.client.patch(url, {"title": "Changed"}, format="json"),
            self.client.delete(url),
        ]

        self.assertTrue(all(response.status_code == status.HTTP_404_NOT_FOUND for response in responses))
        self.other_todo.refresh_from_db()
        self.assertEqual(self.other_todo.title, "Private task")

    def test_owner_can_update_and_delete_a_todo(self):
        self.authenticate()
        url = reverse("todo-detail", args=[self.todo.id])
        update_response = self.client.patch(url, {"completed": True}, format="json")
        delete_response = self.client.delete(url)

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Todo.objects.filter(id=self.todo.id).exists())

    def test_filter_and_search_are_scoped_to_the_account(self):
        self.authenticate()
        Todo.objects.create(account=self.account, title="Book flights", completed=True)
        Todo.objects.create(account=self.account, title="Book hotel", completed=False)

        response = self.client.get(reverse("todo-list"), {"completed": "true", "search": "Book"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["title"] for item in response.data], ["Book flights"])
