import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


def validate_username_arabic_allowed(value):
    if not value:
        raise ValidationError(_('اسم المستخدم مطلوب'))
    
    if re.search(r'[!@#$%^&*()+=\[\]{};:\'",<>?/\\|`~]', value):
        raise ValidationError(
            _('اسم المستخدم لا يمكن أن يحتوي على رموز خاصة')
        )
    
    if len(value) < 2:
        raise ValidationError(
            _('اسم المستخدم يجب أن يكون 2 أحرف على الأقل')
        )
    
    if len(value) > 150:
        raise ValidationError(
            _('اسم المستخدم يجب ألا يزيد عن 150 حرف')
        )
