# main.py

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
# Import the CORS middleware
from fastapi.middleware.cors import CORSMiddleware

import crud
import models
import schemas
from database import SessionLocal, engine
import sheets
import email_sender

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Al-Mursalaat API",
    description="API for handling student applications.",
    version="1.0.0"
)

# --- Add CORS Middleware ---
# This allows your frontend to communicate with your backend.
# In production, you should restrict this to your actual domain.
origins = [
    "http://almursalaatonline.com",
    "https://almursalaatonline.com",
    "http://www.almursalaatonline.com",
    "https://www.almursalaatonline.com",
    # You can also add localhost for local testing if needed
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
def submit_application(
    application: schemas.ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="An application with this email address already exists.")

    new_application = crud.create_application(db=db, application=application)
    application_dict = new_application.__dict__

    # Add Background Tasks for Sheets and Email
    background_tasks.add_task(sheets.append_to_sheet, application_data=application_dict)
    background_tasks.add_task(email_sender.send_student_confirmation, application_data=application_dict)
    background_tasks.add_task(email_sender.send_admin_notification, application_data=application_dict)

    return new_application
