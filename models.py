# models.py

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

# --- SIMPLER IMPORT ---
from database import Base

class Application(Base):
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    parent_name = Column(String)
    relationship = Column(String)
    Gender = Column(String)
    Whatsapp_number = Column(String, nullable=True)
