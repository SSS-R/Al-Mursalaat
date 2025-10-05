# crud.py
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import models
import schemas

# CRUD (Create, Read, Update, Delete) functions interact directly with the database.

pwd_context= CryptContext(schemes=["bcrypt"], deprecated= "auto")

def get_password_hash(password):
    password_bytes = password.encode('utf-8')
    # Truncate character by character to avoid breaking multi-byte characters
    while len(password_bytes) > 72:
        password = password[:-1]
        password_bytes = password.encode('utf-8')
    return pwd_context.hash(password)

def create_user(db: Session, user: schemas.UserCreate, password: str):
    """Hashes the password and creates a new user in the database."""
    hashed_password = get_password_hash(password)
    db_user = models.User(
        **user.model_dump(), 
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_application_by_email(db: Session, email: str):
    """
    Queries the database for an application with a specific email address.
    """
    return db.query(models.Application).filter(models.Application.email == email).first()

def create_application(db: Session, application: schemas.ApplicationCreate):
    """
    Creates a new application record in the database.
    """
    # --- NO CHANGES NEEDED HERE ---
    # This code was already correct. `application.model_dump()` creates a dictionary
    # from the Pydantic model. Because we fixed `models.py`, the keys in this
    # dictionary (e.g., 'gender') now correctly match the attributes of the
    # `models.Application` class.
    application_data = application.model_dump()
    db_application = models.Application(**application_data)
    db.add(db_application)
    db.commit()
    db.refresh(db_application) # Refresh to get the new ID and created_at from the DB
    return db_application

def get_user_by_email(db: Session, email: str):
    """Queries the database for a user with a specific email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves all user records from the database with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
    """Queries the database for a user with a specific ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def delete_user(db: Session, user_id: int):
    """Deletes a user from the database by their ID."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# --- Teacher CRUD Functions ---

def get_teacher(db: Session, teacher_id: int):
    """Queries for a single teacher by their ID."""
    return db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()

def get_teacher_by_email(db: Session, email: str):
    """Queries for a single teacher by their email."""
    return db.query(models.Teacher).filter(models.Teacher.email == email).first()

def get_teachers(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves all teacher records."""
    return db.query(models.Teacher).offset(skip).limit(limit).all()

def create_teacher(db: Session, teacher: schemas.TeacherCreate, password: str):
    """Creates a new teacher record in the database with a hashed password."""
    hashed_password = get_password_hash(password)
    db_teacher = models.Teacher(
        **teacher.model_dump(),
        hashed_password=hashed_password
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def delete_teacher(db: Session, teacher_id: int):
    """Deletes a teacher from the database by their ID."""
    db_teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if db_teacher:
        db.delete(db_teacher)
        db.commit()
    return db_teacher

def assign_teacher_and_shift(db: Session, student_id: int, teacher_id: int, shift: str):
    """Assigns a teacher and shift to a student and updates their status to 'Approved'."""
    db_student = db.query(models.Application).filter(models.Application.id == student_id).first()
    if db_student:
        db_student.teacher_id = teacher_id
        db_student.shift = shift
        db_student.status = "Approved"
        db.commit()
        db.refresh(db_student)
    return db_student

def get_application_by_id(db: Session, application_id: int):
    """Queries for a single application by its ID."""
    return db.query(models.Application).filter(models.Application.id == application_id).first()

def get_applications(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves all application records from the database."""
    return db.query(models.Application).offset(skip).limit(limit).all()
