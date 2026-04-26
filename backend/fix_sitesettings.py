import os
import django
from django.db import connection

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

def fix_sitesettings():
    print("--- Fixing products_sitesettings table ---")
    try:
        with connection.cursor() as cursor:
            # Check if table exists
            tables = connection.introspection.table_names()
            if 'products_sitesettings' not in tables:
                print("Table 'products_sitesettings' does not exist. Creating it...")
                # Create table based on model structure
                cursor.execute("""
                    CREATE TABLE products_sitesettings (
                        id SERIAL PRIMARY KEY,
                        site_name VARCHAR(100) NOT NULL,
                        logo VARCHAR(100),
                        whatsapp_number VARCHAR(20) NOT NULL,
                        telegram_username VARCHAR(100) NOT NULL,
                        contact_phone VARCHAR(20) NOT NULL
                    )
                """)
                print("Table created successfully.")
            else:
                print("Table 'products_sitesettings' already exists.")
                
                # Check for columns
                cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'products_sitesettings'")
                columns = [row[0] for row in cursor.fetchall()]
                
                required_columns = {
                    'site_name': 'VARCHAR(100) NOT NULL DEFAULT \'شركة الريادة المتحدة\'',
                    'logo': 'VARCHAR(100)',
                    'whatsapp_number': 'VARCHAR(20) NOT NULL DEFAULT \'07834950300\'',
                    'telegram_username': 'VARCHAR(100) NOT NULL DEFAULT \'07834950300\'',
                    'contact_phone': 'VARCHAR(20) NOT NULL DEFAULT \'07834950300\''
                }
                
                for col, definition in required_columns.items():
                    if col not in columns:
                        print(f"Adding column '{col}' to 'products_sitesettings'...")
                        cursor.execute(f"ALTER TABLE products_sitesettings ADD COLUMN {col} {definition}")
                        print(f"Column '{col}' added.")
            
            # Ensure at least one instance exists
            cursor.execute("SELECT COUNT(*) FROM products_sitesettings")
            count = cursor.fetchone()[0]
            if count == 0:
                print("No settings found. Inserting default settings...")
                cursor.execute("""
                    INSERT INTO products_sitesettings (site_name, whatsapp_number, telegram_username, contact_phone)
                    VALUES ('شركة الريادة المتحدة', '07834950300', '07834950300', '07834950300')
                """)
                print("Default settings inserted.")
            else:
                # Update existing settings to the correct numbers if needed
                print("Updating existing settings to the correct numbers...")
                cursor.execute("""
                    UPDATE products_sitesettings 
                    SET whatsapp_number = '07834950300', 
                        contact_phone = '07834950300',
                        telegram_username = '07834950300'
                    WHERE whatsapp_number != '07834950300' OR contact_phone != '07834950300'
                """)
                print("Settings updated.")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_sitesettings()
