# main.py

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import SessionLocal, engine
import sheets # Import our new sheets module

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
def submit_application(
    application: schemas.ApplicationCreate,
    background_tasks: BackgroundTasks, # Add BackgroundTasks dependency
    db: Session = Depends(get_db)
):
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="An application with this email address already exists.")

    new_application = crud.create_application(db=db, application=application)

    # --- Write to Google Sheet in the background ---
    # We use background_tasks to run the sheet operation after the response
    # has been sent to the user. This makes the API feel faster.
    print("Adding sheet append task to background.")
    background_tasks.add_task(
        sheets.append_to_sheet,
        application_data=new_application.__dict__
    )

    # TODO: Add Email Logic Here

    return new_application
