
import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

def check_db():
    print("Checking Database...")
    try:
        # Check users table
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users_user';")
            row = cursor.fetchone()
            if row:
                print("Table 'users_user' exists.")
            else:
                print("Table 'users_user' NOT found!")
                
        # Check users
        users = User.objects.all()
        print(f"Total users: {users.count()}")
        for user in users:
            print(f"User: {user.username}, Phone: {user.phone}, ID: {user.id}, Staff: {user.is_staff}, Superuser: {user.is_superuser}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
