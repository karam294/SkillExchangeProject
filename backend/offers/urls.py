from django.urls import path
from .views import OfferListCreateView, OfferDetailView

urlpatterns = [
    path('', OfferListCreateView.as_view()),
    path('<int:pk>/', OfferDetailView.as_view()),
]