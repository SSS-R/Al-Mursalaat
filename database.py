# database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- IMPROVEMENT: Secure Configuration using Environment Variables ---
# Hardcoding credentials in your code is risky. It's much safer to
# load them from environment variables. This also makes your application
# more flexible to deploy in different environments (dev, staging, prod).

# Allow forcing SQLite or defaulting to it if no DB_USER is set
USE_SQLITE = os.getenv("USE_SQLITE", "False").lower() in ("true", "1", "t")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD", "al-mursalaat")
DB_HOST = os.getenv("DB_HOST", "localhost") # Default to localhost for production
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "al_mursalaat")

if USE_SQLITE or not DB_USER:
    # Use SQLite
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
    # connect_args={"check_same_thread": False} is needed for SQLite
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    print("--- DATA SOURCE: Using SQLite Database ---")
else:
    # Use PostgreSQL
    SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    print(f"--- DATA SOURCE: Using PostgreSQL ({DB_HOST}) ---")

# --- Database Session ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Base Class for Models ---
Base = declarative_base()
