# models.py

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Application(Base):
    """
    SQLAlchemy model for the 'applications' table in the database.
    This defines the structure of your table.
    """
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    country = Column(String)
    preferred_course = Column(String)
    age = Column(Integer)
    previous_experience = Column(String, nullable=True)
    learning_goals = Column(String, nullable=True)
    parent_name = Column(String)
    relationship = Column(String) # e.g., 'Self', 'Father', 'Mother'

    # --- FIX: Standardized Column Naming ---
    # Changed 'Gender' to 'gender' and 'Whatsapp_number' to 'whatsapp_number'.
    # Using consistent lowercase 'snake_case' is a standard practice and
    # prevents mismatches with the Pydantic schemas.
    gender = Column(String)
    whatsapp_number = Column(String, nullable=True)

    # Timestamps are handled automatically by the database
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
