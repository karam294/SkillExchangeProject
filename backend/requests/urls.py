from django.urls import path
from .views import RequestListCreateView, RequestStatusUpdateView

urlpatterns = [
    path('', RequestListCreateView.as_view()),
    path('<int:pk>/', RequestStatusUpdateView.as_view()),
]
