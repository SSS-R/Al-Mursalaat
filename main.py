# main.py

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
import jwt
from jwt.exceptions import InvalidTokenError

import crud
import models
import schemas
from database import SessionLocal, engine
import sheets
import email_sender

# It's good practice to load environment variables at the start of your application
load_dotenv()

# --- ADD THIS TEMPORARY DEBUG LINE ---
print(f"--- DEBUG: Attempting to connect with USER='{os.getenv('DB_USER')}' to HOST='{os.getenv('DB_HOST')}' ---")

# Create the database tables based on your models
models.Base.metadata.create_all(bind=engine)


# --- ADD your JWT Secret Key ---
# IMPORTANT: This secret key MUST be the exact same one you used in your
# Next.js login API route (`app/api/auth/login/route.ts`).
JWT_SECRET = os.getenv("JWT_SECRET", "YOUR_SUPER_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG")
ALGORITHM = "HS256"



app = FastAPI(
    title="Al-Mursalaat API",
    description="API for handling student applications.",
    version="1.0.0"
)


# --- Initialize the rate limiter ---
@app.on_event("startup")
async def startup():
    # Connect to your local Redis server
    redis_connection = redis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_connection)

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

# --- 1. ADD THE NEW SECURITY DEPENDENCY ---
# This function acts as a security guard for our admin-only endpoints.
async def get_current_admin(request: Request, db: Session = Depends(get_db)):
    """
    Reads the session cookie, validates the JWT, and ensures the user has an admin role.
    """
    token = request.cookies.get("sessionToken")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated: No session token found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        # Decode the token using the secret key
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        role: str = payload.get("role")
        if email is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token: Missing payload.")
        
        # This is where we check for permission!
        if role not in ["admin", "supreme-admin"]:
            raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions.")

        # You could add a check here to see if the user exists in the DB if needed
        # user = crud.get_user_by_email(db, email=email) ...
        
        return payload # Return the user's data if token is valid
    
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token: Could not validate credentials.")

# --- API Endpoints ---

# --- 2. ADD THE NEW ADMIN-ONLY ENDPOINT ---
# This goes below the get_db() function and before your existing endpoints.

@app.post("/admin/add-student/", response_model=schemas.Application, status_code=201)
def add_student_by_admin(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin) # This line PROTECTS the endpoint
):
    """
    An admin-only endpoint to create a new student record manually.
    """
    # Check for duplicate email
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="A student with this email address already exists.")

    # We can reuse the existing CRUD function!
    print(f"Admin '{current_admin.get('email')}' is adding a new student.")
    new_student = crud.create_application(db=db, application=application)
    
    # Note: We are not running background tasks like sending confirmation emails
    # because this is a manual admin action. This can be added if needed.
    
    return new_student

@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Welcome to the Al-Mursalaat API!"}

@app.post("/submit-application/", response_model=schemas.Application, dependencies=[Depends(RateLimiter(times=3, minutes=2))])
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
