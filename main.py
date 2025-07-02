# main.py

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

# --- SIMPLER IMPORTS ---
import crud
import models
import schemas
from database import SessionLocal, engine

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Al-Mursalaat API",
    description="API for handling student applications.",
    version="1.0.0"
)

# Dependency for Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Al-Mursalaat API!"}

@app.post("/submit-application/", response_model=schemas.Application)
def submit_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="An application with this email address already exists.")

    new_application = crud.create_application(db=db, application=application)

    # TODO: Add Email and Google Sheets Logic Here

    return new_application
