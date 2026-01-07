
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'username', 'first_name', 'last_name', 'is_staff', 'is_customer', 'is_wholesale')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_customer', 'is_wholesale')
    search_fields = ('email', 'username', 'phone', 'first_name', 'last_name')
    ordering = ('phone',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('المعلومات الشخصية', {'fields': ('first_name', 'last_name', 'phone', 'address', 'governorate')}),
        ('الصلاحيات', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_customer', 'is_wholesale', 'groups', 'user_permissions')}),
        ('التواريخ المهمة', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


# تسجيل النماذج مع لوحة الإدارة
admin.site.register(User, UserAdmin)
