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

DB_USER = os.getenv("DB_USER", "mursalaat")
DB_PASSWORD = os.getenv("DB_PASSWORD", "al-mursalaat")
DB_HOST = os.getenv("DB_HOST", "localhost") # Default to localhost for production
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "al_mursalaat")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- SQLAlchemy Engine ---
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# --- Database Session ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Base Class for Models ---
Base = declarative_base()
