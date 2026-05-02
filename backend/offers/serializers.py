from rest_framework import serializers
from .models import Offer


class OfferSerializer(serializers.ModelSerializer):
    skill_title = serializers.CharField(source='skill.title', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)
    provider_id = serializers.IntegerField(source='user.id', read_only=True)
    provider_username = serializers.CharField(source='user.username', read_only=True)
    provider_first_name = serializers.CharField(source='user.first_name', read_only=True)
    provider_last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id',
            'user',
            'provider_id',
            'provider_username',
            'provider_first_name',
            'provider_last_name',
            'skill',
            'skill_title',
            'skill_category',
            'price',
            'availability',
            'description',
            'created_at',
        ]
        read_only_fields = ['user']
