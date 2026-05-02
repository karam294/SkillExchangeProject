from rest_framework import permissions


class IsOfferOwnerForRequest(permissions.BasePermission):
    message = 'Only the provider who owns this offer can accept or reject the request.'

    def has_object_permission(self, request, view, obj):
        return obj.offer.user_id == request.user.id
