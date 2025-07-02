# crud.py

from sqlalchemy.orm import Session

# --- SIMPLER IMPORTS ---
import models
import schemas

def get_application_by_email(db: Session, email: str):
    return db.query(models.Application).filter(models.Application.email == email).first()

def create_application(db: Session, application: schemas.ApplicationCreate):
    application_data = application.model_dump()
    db_application = models.Application(**application_data)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application
