from django.urls import path
from .views import RequestListCreateView, RequestUpdateView

urlpatterns = [
    path('', RequestListCreateView.as_view()),
    path('<int:pk>/', RequestUpdateView.as_view()),
]