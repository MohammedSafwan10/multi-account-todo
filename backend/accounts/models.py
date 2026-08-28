from django.db import models


class Account(models.Model):
    auth0_user_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(blank=True)
    display_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.email or self.auth0_user_id
