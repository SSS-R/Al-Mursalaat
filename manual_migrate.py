# Migration script to add missing columns

from database import engine
from sqlalchemy import text

def migrate():
    print(f"Migrating database using engine: {engine.url}")
    with engine.connect() as conn:
        try:
            print("Adding profile_photo_url column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_photo_url VARCHAR"))
            conn.commit()
            print("Success.")
        except Exception as e:
            print(f"Skipped profile_photo_url: {e}")
            
        try:
            print("Adding cv_url column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN cv_url VARCHAR"))
            conn.commit()
            print("Success.")
        except Exception as e:
            print(f"Skipped cv_url: {e}")

if __name__ == "__main__":
    migrate()
