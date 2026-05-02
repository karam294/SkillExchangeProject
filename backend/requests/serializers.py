from rest_framework import serializers
from .models import Request


class RequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['offer', 'message']


class RequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    requester_id = serializers.IntegerField(source='requester.id', read_only=True)
    offer_skill_title = serializers.CharField(source='offer.skill.title', read_only=True)
    offer_id = serializers.IntegerField(source='offer.id', read_only=True)
    offer_price = serializers.FloatField(source='offer.price', read_only=True)

    class Meta:
        model = Request
        fields = [
            'id',
            'requester',
            'requester_id',
            'requester_username',
            'offer',
            'offer_id',
            'offer_skill_title',
            'offer_price',
            'message',
            'status',
            'created_at',
        ]


class RequestStatusSerializer(serializers.ModelSerializer):
    """Provider-only update: accept or reject."""

    class Meta:
        model = Request
        fields = ['status']
