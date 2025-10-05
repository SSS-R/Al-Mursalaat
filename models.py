# models.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
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
    status = Column(String, default='Pending')
    previous_experience = Column(String, nullable=True)
    learning_goals = Column(String, nullable=True)
    parent_name = Column(String)
    relationship_with_student = Column(String) # e.g., 'Self', 'Father', 'Mother'

    # --- FIX: Standardized Column Naming ---
    # Changed 'Gender' to 'gender' and 'Whatsapp_number' to 'whatsapp_number'.
    # Using consistent lowercase 'snake_case' is a standard practice and
    # prevents mismatches with the Pydantic schemas.
    gender = Column(String)
    whatsapp_number = Column(String, nullable=True)
    shift = Column(String, nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    teacher = relationship("Teacher", back_populates="students")

    # Timestamps are handled automatically by the database
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    """
    SQLAlchemy model for the 'users' table.
    This will store admins and the supreme admin.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String)
    whatsapp_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="admin") # e.g., 'admin' or 'supreme-admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Teacher(Base):
    """SQLAlchemy model for the 'teachers' table."""
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    whatsapp_number = Column(String, nullable=True)
    shift = Column(String)  # e.g., 'Morning', 'Afternoon', 'Evening'
    hashed_password = Column(String, nullable=True) # Making it nullable for now
    role = Column(String, default="teacher") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    students = relationship("Application", back_populates="teacher")