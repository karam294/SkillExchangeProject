from rest_framework import filters, generics, permissions
from .models import Review
from .serializers import ReviewSerializer


class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class UserReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return Review.objects.filter(reviewed_user_id=user_id).select_related(
            'reviewer', 'reviewed_user'
        )


class ReviewsGivenByMeListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(reviewer=self.request.user).select_related(
            'reviewer', 'reviewed_user'
        ).order_by('-created_at')


class ReviewsReceivedByMeListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(reviewed_user=self.request.user).select_related(
            'reviewer', 'reviewed_user'
        ).order_by('-created_at')
