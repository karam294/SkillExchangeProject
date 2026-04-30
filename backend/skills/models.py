from django.db import models

class Skill(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=100)
    image = models.ImageField(upload_to='skills/', blank=True, null=True)

    def __str__(self):
        return self.title