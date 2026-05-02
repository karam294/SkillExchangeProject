from rest_framework import filters, generics
from .models import Skill
from .serializers import SkillSerializer
from rest_framework.permissions import IsAuthenticated


class SkillListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description", "category"]
    


