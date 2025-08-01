# main.py

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

import crud
import models
import schemas
from database import SessionLocal, engine
import sheets
import email_sender

# It's good practice to load environment variables at the start of your application
load_dotenv()

# Create the database tables based on your models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Al-Mursalaat API",
    description="API for handling student applications.",
    version="1.0.0"
)

# --- CORS Middleware ---
# This allows your frontend application to make requests to this backend.
# In a production environment, you should restrict this to your actual domain for security.
origins = [
    "http://almursalaatonline.com",
    "https://almursalaatonline.com",
    "http://www.almursalaatonline.com",
    "https://www.almursalaatonline.com",
    # Added for local development with common frontend ports
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- Dependency for Database Session ---
# This function creates a new database session for each request and closes it when done.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Welcome to the Al-Mursalaat API!"}

@app.post("/submit-application/", response_model=schemas.Application)
def submit_application(
    application: schemas.ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Endpoint to receive, validate, and process a new student application.
    """
    # Check if an application with the same email already exists to prevent duplicates.
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="An application with this email address already exists.")

    # Create the new application record in the database
    new_application = crud.create_application(db=db, application=application)

    # --- IMPROVEMENT: Clean Data for Background Tasks ---
    # Instead of passing `new_application.__dict__`, which contains internal SQLAlchemy
    # state, we convert the SQLAlchemy object back to a Pydantic model.
    # This ensures a clean, predictable dictionary structure.
    application_schema = schemas.Application.from_orm(new_application)
    application_dict = application_schema.model_dump()


    # Add background tasks to run after the response is sent.
    # This makes the API feel faster for the user.
    background_tasks.add_task(sheets.append_to_sheet, application_data=application_dict)
    background_tasks.add_task(email_sender.send_student_confirmation, application_data=application_dict)
    background_tasks.add_task(email_sender.send_admin_notification, application_data=application_dict)

    return new_application
