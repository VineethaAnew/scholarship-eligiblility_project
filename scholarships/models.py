from django.db import models

# Create your models here.
#from django.db import models
from django.conf import settings

class ScholarshipApplication(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    college = models.CharField(max_length=150)
    parents_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    marks = models.IntegerField()
    is_eligible = models.BooleanField(default=False)

    # Bank details – can be empty if not eligible
    bank_account_number = models.CharField(max_length=30, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=20, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Eligibility rule: marks >= 75
        self.is_eligible = self.marks >= 75
        # If not eligible, clear bank details
        if not self.is_eligible:
            self.bank_account_number = None
            self.bank_ifsc = None
            self.bank_name = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.marks} - {'Eligible' if self.is_eligible else 'Not eligible'}"
