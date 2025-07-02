# Backend/database/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Database Connection URL ---
# This is the connection string for your PostgreSQL database.
# Format: "postgresql://<user>:<password>@<host>:<port>/<database_name>"
#
# IMPORTANT: Replace these values with the ones you created on your Ubuntu server.
# For development, you'll connect to the server's local IP.
# When deployed, the host will be 'localhost' since the app and DB are on the same server.

# TODO: Replace with your actual database credentials
DB_USER = "mursalaat"
DB_PASSWORD = "al-mursalaat"
DB_HOST = "192.168.0.231" # Use your server's local IP for development
DB_PORT = "5432"
DB_NAME = "al_mursalaat"

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


# --- SQLAlchemy Engine ---
# The engine is the central point of contact for the database.
engine = create_engine(SQLALCHEMY_DATABASE_URL)


# --- Database Session ---
# A session is the primary interface for all database operations.
# We create a SessionLocal class that will be used to create individual
# database sessions for each request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# --- Base Class for Models ---
# We will use this Base class to create our SQLAlchemy ORM models (our database tables).
Base = declarative_base()

