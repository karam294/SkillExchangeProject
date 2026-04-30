from rest_framework import generics, permissions
from .models import Offer
from .serializers import OfferSerializer
from .permissions import IsOwnerOrReadOnly

class OfferListCreateView(generics.ListCreateAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from .permissions import IsOwnerOrReadOnly

class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Offer.objects.all()  
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]