from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Todo
from .permissions import IsTodoOwner
from .serializers import TodoSerializer


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = (IsAuthenticated, IsTodoOwner)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("title",)
    ordering_fields = ("created_at", "updated_at", "title")
    ordering = ("-created_at",)

    def get_queryset(self):
        queryset = Todo.objects.filter(account=self.request.user)
        completed = self.request.query_params.get("completed")
        if completed in {"true", "false"}:
            queryset = queryset.filter(completed=completed == "true")
        return queryset

    def perform_create(self, serializer):
        serializer.save(account=self.request.user)
