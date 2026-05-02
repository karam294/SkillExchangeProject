from rest_framework import filters, generics, permissions
from .models import Offer
from .serializers import OfferSerializer
from .permissions import IsOwnerOrReadOnly


class OfferListCreateView(generics.ListCreateAPIView):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["description", "availability", "skill__title", "user__username"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Offer.objects.select_related('skill', 'user').all()
        if self.request.query_params.get('mine') == '1':
            return qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Offer.objects.select_related('skill', 'user').all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
