from django.db.models import Q
from rest_framework import generics, permissions
from .models import Request
from .serializers import RequestSerializer, RequestCreateSerializer, RequestStatusSerializer
from .permissions import IsOfferOwnerForRequest


class RequestListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RequestCreateSerializer
        return RequestSerializer

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role', 'all')
        base = Request.objects.filter(Q(requester=user) | Q(offer__user=user)).select_related(
            'requester', 'offer', 'offer__skill'
        )
        if role == 'provider':
            return base.filter(offer__user=user).order_by('-created_at')
        if role == 'requester':
            return base.filter(requester=user).order_by('-created_at')
        return base.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class RequestStatusUpdateView(generics.UpdateAPIView):
    queryset = Request.objects.select_related('offer', 'offer__user')
    serializer_class = RequestStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsOfferOwnerForRequest]
