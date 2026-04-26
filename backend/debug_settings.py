
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import SiteSettings
from products.serializers import SiteSettingsSerializer

def debug_settings():
    print("--- Debugging SiteSettings ---")
    try:
        count = SiteSettings.objects.count()
        print(f"Total SiteSettings records: {count}")
        
        if count > 0:
            s = SiteSettings.objects.first()
            print(f"ID: {s.id}")
            print(f"Name: {s.site_name}")
            print(f"Logo field: {s.logo}")
            if s.logo:
                try:
                    print(f"Logo URL: {s.logo.url}")
                except Exception as e:
                    print(f"Error getting logo URL: {e}")
            
            # Test serialization
            try:
                serializer = SiteSettingsSerializer(s)
                print(f"Serialized data: {serializer.data}")
            except Exception as e:
                print(f"Serialization error: {e}")
        else:
            print("No SiteSettings records found.")
            
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    debug_settings()
