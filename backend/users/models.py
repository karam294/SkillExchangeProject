from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    cv_file = models.FileField(upload_to='cvs/', blank=True, null=True)

    def __str__(self):
        return self.username