
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    
    def save(self, *args, **kwargs):
        # Ensure we don't force update without a PK to avoid ValueError during login
        if 'update_fields' in kwargs and self.pk is None:
            kwargs.pop('update_fields')
        super().save(*args, **kwargs)
        
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    phone = models.CharField(max_length=20, unique=True, verbose_name="رقم الهاتف")
    address = models.TextField(blank=True, null=True, verbose_name="العنوان")
    governorate = models.CharField(max_length=50, blank=True, null=True, verbose_name="المحافظة")
    is_customer = models.BooleanField(default=True, verbose_name="عميل")
    is_wholesale = models.BooleanField(default=False, verbose_name="تاجر جملة")
    is_staff_member = models.BooleanField(default=False, verbose_name="موظف")

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = "مستخدم"
        verbose_name_plural = "المستخدمون"

    def __str__(self):
        return self.username
