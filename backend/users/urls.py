from django.urls import path
from .views import (
    RegisterView,
    login_view,
    CurrentUserView,
    UserDirectoryListView,
    UserPublicProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', login_view),
    path('me/', CurrentUserView.as_view()),
    path('directory/', UserDirectoryListView.as_view()),
    path('<int:pk>/', UserPublicProfileView.as_view()),
]
