from django.contrib import admin

from .models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("auth0_user_id", "email", "display_name", "created_at")
    search_fields = ("auth0_user_id", "email", "display_name")
