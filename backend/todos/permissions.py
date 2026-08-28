from rest_framework.permissions import BasePermission


class IsTodoOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.account_id == request.user.id
