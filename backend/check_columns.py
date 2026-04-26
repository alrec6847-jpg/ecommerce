
import os
import django
from django.db import connection

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

def check_columns():
    print("--- Checking columns of products_sitesettings ---")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'products_sitesettings'")
            columns = cursor.fetchall()
            if not columns:
                # Try without schema check or for sqlite
                try:
                    cursor.execute("PRAGMA table_info(products_sitesettings)")
                    columns = cursor.fetchall()
                    if columns:
                        print("Columns (SQLite):")
                        for col in columns:
                            print(f"- {col[1]}")
                    else:
                        print("Table not found or no columns.")
                except:
                    print("Table not found.")
            else:
                print("Columns (PostgreSQL):")
                for col in columns:
                    print(f"- {col[0]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_columns()
