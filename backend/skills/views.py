from rest_framework import generics
from .models import Skill
from .serializers import SkillSerializer
from rest_framework.permissions import IsAuthenticated


class SkillListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer