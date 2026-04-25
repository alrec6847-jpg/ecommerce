from django.conf import settings
from products.models import SiteSettings

def currency(request):
    """Provide currency symbol and code to all templates"""
    return {
        'CURRENCY_SYMBOL': getattr(settings, 'CURRENCY_SYMBOL', 'د.ع'),
        'CURRENCY_CODE': getattr(settings, 'CURRENCY_CODE', 'IQD'),
    }

def site_settings(request):
    """Provide site settings to all templates"""
    try:
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            # Don't create here to avoid side effects during read-only ops
            # Just return a dummy object or None
            return {'site_settings': None}
        return {
            'site_settings': settings_obj
        }
    except:
        return {'site_settings': None}
