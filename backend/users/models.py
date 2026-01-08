
from django.contrib.auth.models import AbstractUser
from django.db import models
from .validators import validate_username_arabic_allowed


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    username = models.CharField(
        max_length=150, 
        unique=True, 
        verbose_name="اسم المستخدم",
        validators=[validate_username_arabic_allowed],
        help_text="يمكنك استخدام الحروف العربية والإنجليزية والأرقام والشرطات السفلية"
    )
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني", unique=False)
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
