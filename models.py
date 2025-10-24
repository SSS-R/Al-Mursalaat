# models.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Time
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
    state=Column(String, nullable= True)
    preferred_course = Column(String)
    age = Column(Integer)
    status = Column(String, default='Pending')
    previous_experience = Column(String, nullable=True)
    learning_goals = Column(String, nullable=True)
    parent_name = Column(String, nullable=True)
    relationship_with_student = Column(String, nullable= True) # e.g., 'Self', 'Father', 'Mother'

    # --- FIX: Standardized Column Naming ---
    # Changed 'Gender' to 'gender' and 'Whatsapp_number' to 'whatsapp_number'.
    # Using consistent lowercase 'snake_case' is a standard practice and
    # prevents mismatches with the Pydantic schemas.
    gender = Column(String)
    whatsapp_number = Column(String, nullable=True)
    shift = Column(String, nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    teacher = relationship("Teacher", back_populates="students")
    attendances = relationship("Attendance", back_populates="student")
    # Timestamps are handled automatically by the database
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    attendances = relationship("Attendance", back_populates="student")
    schedule = relationship("Schedule", back_populates="student", uselist=False)

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
    gender = Column(String)
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
    gender = Column(String)
    shift = Column(String)  # e.g., 'Morning', 'Afternoon', 'Evening'
    hashed_password = Column(String, nullable=True) # Making it nullable for now
    role = Column(String, default="teacher")
    profile_photo_url = Column(String, nullable=True)
    cv_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    students = relationship("Application", back_populates="teacher")
    attendances = relationship("Attendance", back_populates="teacher")
    schedules = relationship("Schedule", back_populates="teacher")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    class_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # e.g., 'Present', 'Absent', 'Late'
    notes = Column(String, nullable=True)

    student_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)

    student = relationship("Application", back_populates="attendances")
    teacher = relationship("Teacher", back_populates="attendances")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String, nullable=False) # e.g., 'Sunday', 'Monday'
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    zoom_link = Column(String, nullable=True)

    student_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)

    student = relationship("Application", back_populates="schedule")
    teacher = relationship("Teacher", back_populates="schedules")
