
import os
import django
from decouple import config
import dj_database_url

# Manual setup of settings to use the Supabase URL
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Override database setting before setup
from django.conf import settings
if not settings.configured:
    # We need to call setup() but with a different database
    # Actually, it's easier to just modify the environment variable that decouple uses
    os.environ['DB_HOST'] = 'db.jbixpdnmezcgtretuawl.supabase.co'
    os.environ['DB_USER'] = 'postgres'
    os.environ['DB_PASSWORD'] = '2kkpj0W5CijY1WO1'
    os.environ['DB_NAME'] = 'postgres'
    os.environ['DB_PORT'] = '5432'

django.setup()

from products.models import Product, Category

def check_categories():
    print("Checking categories for loops...")
    for cat in Category.objects.all():
        path = [cat.id]
        curr = cat
        while curr.parent:
            if curr.parent.id in path:
                print(f"LOOP DETECTED: Category {cat.name} (ID: {cat.id}) has a loop in its parent chain!")
                return
            path.append(curr.parent.id)
            curr = curr.parent
    print("No category loops found.")

def check_products():
    print("Checking products for missing categories...")
    missing = Product.objects.filter(category__isnull=True)
    if missing.exists():
        print(f"FOUND {missing.count()} products without categories!")
        for p in missing:
            print(f"  - Product: {p.name} (ID: {p.id})")
    else:
        print("All products have categories.")

if __name__ == "__main__":
    check_categories()
    check_products()
