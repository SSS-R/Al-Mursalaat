# crud.py
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import models
import schemas

# CRUD (Create, Read, Update, Delete) functions interact directly with the database.

pwd_context= CryptContext(schemes=["bcrypt"], deprecated= "auto")

def get_password_hash(password):
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