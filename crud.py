# crud.py

from sqlalchemy.orm import Session
import models
import schemas

# CRUD (Create, Read, Update, Delete) functions interact directly with the database.

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
