from django.urls import path
from .views import (
    ReviewCreateView,
    UserReviewListView,
    ReviewsGivenByMeListView,
    ReviewsReceivedByMeListView,
)

urlpatterns = [
    path('', ReviewCreateView.as_view()),
    path('my/given/', ReviewsGivenByMeListView.as_view()),
    path('my/received/', ReviewsReceivedByMeListView.as_view()),
    path('<int:user_id>/', UserReviewListView.as_view()),
]
