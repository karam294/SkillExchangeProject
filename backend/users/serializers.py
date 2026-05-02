from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Safe fields for the authenticated user to view and update."""

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'bio',
            'profile_image',
            'cv_file',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'username', 'email', 'date_joined', 'last_login']


class UserDirectorySerializer(serializers.ModelSerializer):
    """Compact user row for pickers (id, names, avatar)."""

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_image']


class PublicUserSerializer(serializers.ModelSerializer):
    """Public profile for marketplace (no email or CV)."""

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'bio',
            'profile_image',
            'date_joined',
        ]
        read_only_fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'bio',
            'profile_image',
            'date_joined',
        ]
