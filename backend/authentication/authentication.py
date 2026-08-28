from django.conf import settings
from jwt import PyJWKClient, decode
from jwt.exceptions import PyJWTError
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from accounts.models import Account


class Auth0JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header:
            return None
        if len(header) != 2 or header[0].lower() != b"bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        try:
            token = header[1].decode("utf-8")
            signing_key = PyJWKClient(settings.AUTH0_JWKS_URL).get_signing_key_from_jwt(token)
            claims = decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=settings.AUTH0_AUDIENCE,
                issuer=settings.AUTH0_ISSUER,
                options={"require": ["exp", "iat", "sub"]},
            )
        except (PyJWTError, UnicodeDecodeError) as exc:
            raise AuthenticationFailed("Invalid or expired access token.") from exc

        account, _ = Account.objects.get_or_create(auth0_user_id=claims["sub"])
        self._update_profile(account, claims)
        return account, claims

    def authenticate_header(self, request):
        return "Bearer"

    @staticmethod
    def _update_profile(account, claims):
        changed_fields = []
        for claim, field in (("email", "email"), ("name", "display_name")):
            value = claims.get(claim)
            if value and getattr(account, field) != value:
                setattr(account, field, value)
                changed_fields.append(field)
        if changed_fields:
            account.save(update_fields=changed_fields)
