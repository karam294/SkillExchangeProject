from django.urls import path
from .views import ReviewCreateView, UserReviewListView

urlpatterns = [
    path('', ReviewCreateView.as_view()),
    path('<int:user_id>/', UserReviewListView.as_view()),
]