from types import SimpleNamespace
from unittest.mock import patch

from jwt.exceptions import InvalidTokenError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.test import APIRequestFactory, APITestCase

from accounts.models import Account

from .authentication import Auth0JWTAuthentication


class Auth0JWTAuthenticationTests(APITestCase):
    def setUp(self):
        self.request = APIRequestFactory().get("/api/todos/", HTTP_AUTHORIZATION="Bearer access-token")
        self.authenticator = Auth0JWTAuthentication()

    @patch("authentication.authentication.decode")
    @patch("authentication.authentication.PyJWKClient")
    def test_valid_token_creates_and_returns_the_local_account(self, jwk_client, decode_token):
        jwk_client.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key="public-key")
        decode_token.return_value = {
            "sub": "auth0|new-user",
            "email": "person@example.com",
            "name": "Person Name",
            "iat": 1,
            "exp": 2,
        }

        account, claims = self.authenticator.authenticate(self.request)

        self.assertEqual(claims["sub"], "auth0|new-user")
        self.assertEqual(account.email, "person@example.com")
        self.assertTrue(Account.objects.filter(auth0_user_id="auth0|new-user").exists())

    @patch("authentication.authentication.decode", side_effect=InvalidTokenError)
    @patch("authentication.authentication.PyJWKClient")
    def test_invalid_token_is_rejected(self, jwk_client, decode_token):
        jwk_client.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(key="public-key")

        with self.assertRaises(AuthenticationFailed):
            self.authenticator.authenticate(self.request)

    def test_missing_authorization_header_defers_authentication(self):
        request = APIRequestFactory().get("/api/todos/")

        self.assertIsNone(self.authenticator.authenticate(request))
