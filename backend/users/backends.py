
from django.contrib.auth.backends import BaseBackend
from .models import User
from django.db.models import Q

class PhoneBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # البحث عن المستخدم باستخدام رقم الهاتف أو اسم المستخدم
            user = User.objects.get(
                Q(phone=username) | Q(username=username)
            )

            # التحقق من كلمة المرور
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
