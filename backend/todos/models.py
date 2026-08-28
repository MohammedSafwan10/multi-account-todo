from django.db import models

from accounts.models import Account


class Todo(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="todos")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("account", "completed")),
            models.Index(fields=("account", "created_at")),
        ]

    def __str__(self):
        return self.title
