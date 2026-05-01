from rest_framework import filters, generics
from .models import Review
from .serializers import ReviewSerializer

class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class UserReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return Review.objects.filter(reviewed_user_id=user_id)