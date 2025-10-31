# main.py
from datetime import datetime, date, timedelta
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
import jwt
from jwt.exceptions import InvalidTokenError
import secrets
import string
from typing import List, Optional
import crud
import models
import schemas
from database import SessionLocal, engine
import sheets
import email_sender
import file_handler
from fastapi.security import OAuth2PasswordRequestForm

load_dotenv()

print(f"--- DEBUG: Attempting to connect with USER='{os.getenv('DB_USER')}' to HOST='{os.getenv('DB_HOST')}' ---")

models.Base.metadata.create_all(bind=engine)

JWT_SECRET = os.getenv("JWT_SECRET", "YOUR_SUPER_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG")
ALGORITHM = "HS256"

app = FastAPI(
    title="Al-Mursalaat API",
    description="API for handling student applications.",
    version="1.0.0"
)
@app.on_event("startup")
def create_supreme_admin_on_startup():
    """Checks for and creates the supreme admin on server startup."""
    
    print("--- Checking for Supreme Admin on startup ---")
    
    # 1. Get admin details from .env
    ADMIN_EMAIL = os.getenv("SUPREME_ADMIN_EMAIL")
    ADMIN_PASSWORD = os.getenv("SUPREME_ADMIN_PASSWORD")
    
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        print("WARNING: SUPREME_ADMIN_EMAIL or SUPREME_ADMIN_PASSWORD not set in .env. Skipping admin creation.")
        return

    # 2. Get a database session
    db = SessionLocal()
    
    try:
        # 3. Check if user already exists IN THE 'users' TABLE
        # We use get_user_by_email, not get_user_or_teacher_by_email
        admin = crud.get_user_by_email(db, email=ADMIN_EMAIL)
        
        if not admin:
            # 4. If not, create the user
            print(f"Supreme Admin '{ADMIN_EMAIL}' not found. Creating...")
            
            # Create the user object based on schemas.UserCreate
            admin_schema = schemas.UserCreate(
                email=ADMIN_EMAIL,
                name="Supreme Admin",         # Default value
                phone_number="0000000000",    # Default value
                gender="N/A",                # Default value
                whatsapp_number="0000000000", # Default value
                role="supreme-admin"         # CRITICAL: Set role
            )
            
            # Use your existing crud function to create the user
            crud.create_user(db=db, user=admin_schema, password=ADMIN_PASSWORD)
            print(f"Supreme Admin '{ADMIN_EMAIL}' created successfully.")
        
        else:
            print(f"Supreme Admin '{ADMIN_EMAIL}' already exists.")
            
    except Exception as e:
        print(f"--- ERROR checking/creating supreme admin: {e} ---")
    finally:
        # 5. Always close the session
        db.close()

@app.on_event("startup")
async def startup():
    redis_connection = redis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_connection)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded teacher photos and CVs
BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "Frontend" / "public"
app.mount("/bucket", StaticFiles(directory=str(STATIC_DIR / "bucket")), name="bucket")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_admin(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("sessionToken")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated: No session token found.")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        role: str = payload.get("role")
        if email is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token: Missing payload.")
        
        # Fetch the full user/teacher object from the database
        user = crud.get_user_or_teacher_by_email(db, email=email)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found.")
        
        # Check for correct role (this is a redundant but safe check)
        if user.role not in ["admin", "supreme-admin", "teacher"]:
            raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions.")

        return user # Return the full database object
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token: Could not validate credentials.")

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Al-Mursalaat API!"}

@app.post("/submit-application/", response_model=schemas.Application, dependencies=[Depends(RateLimiter(times=3, minutes=2))])
def submit_application(application: schemas.ApplicationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="An application with this email address already exists.")
    new_application = crud.create_application(db=db, application=application)
    application_dict = schemas.Application.from_orm(new_application).model_dump()
    background_tasks.add_task(sheets.append_to_sheet, application_data=application_dict)
    background_tasks.add_task(email_sender.send_student_confirmation, application_data=application_dict)
    background_tasks.add_task(email_sender.send_admin_notification, application_data=application_dict)
    return new_application

@app.post("/login")
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    print("--- LOGIN ATTEMPT ---")
    print(f"Form Data Received: username='{form_data.username}'")
    
    # --- SIMPLIFIED LOGIC ---
    # Authenticate against the database for ALL users, including supreme-admin.
    # The startup event ensures the supreme-admin exists in the database.
    user = crud.authenticate_user(db, email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create the JWT token
    access_token_expires = timedelta(minutes=60)
    expire = datetime.utcnow() + access_token_expires
    payload = {
        "email": user.email,
        "role": user.role,
        "exp": expire
    }
    access_token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    
    return {"access_token": access_token, "token_type": "bearer"}
# --- Admin/User Endpoints ---

@app.get("/admin/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.post("/admin/create-admin/", response_model=schemas.User, status_code=201)
def create_admin_user(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.role != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="An admin with this email already exists.")
    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for i in range(10))
    new_user = crud.create_user(db=db, user=user, password=temp_password)
    background_tasks.add_task(email_sender.send_admin_credentials_email, admin_data=schemas.User.from_orm(new_user).model_dump(), temp_password=temp_password)
    return new_user

@app.delete("/admin/users/{user_id}", response_model=schemas.User)
def delete_admin_user(user_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.role != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    user_to_delete = crud.get_user(db, user_id=user_id)
    if user_to_delete is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if user_to_delete.email == current_admin.email:
        raise HTTPException(status_code=400, detail="Action not allowed: You cannot delete your own account.")
    crud.delete_user(db=db, user_id=user_id)
    return user_to_delete

@app.post("/admin/users/me/change-password")
def change_current_user_password(
    password_data: schemas.PasswordUpdate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Allows a logged-in user (admin or teacher) to change their own password."""
    user_email = current_admin.email
    
    # Use the generic function to find the user in either table
    db_user = crud.get_user_or_teacher_by_email(db, email=user_email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not crud.verify_password(password_data.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")

    # Use the generic function to update the password
    crud.update_password(db, user_obj=db_user, new_password=password_data.new_password)
    
    return {"message": "Password updated successfully."}

# --- Teacher Endpoints ---

@app.get("/admin/teachers/", response_model=list[schemas.TeacherWithStudents])
def read_teachers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    # The type hint here is now a database model, not a dictionary
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Retrieves a list of teachers, filtered by the logged-in admin's gender.
    Supreme admins get all teachers.
    """
    if current_admin.role == "supreme-admin":
        # Supreme admin sees all teachers
        teachers = crud.get_teachers(db, skip=skip, limit=limit)
    else:
        # Normal admins only see teachers of the same gender
        teachers = crud.get_teachers_by_gender(db, gender=current_admin.gender, skip=skip, limit=limit)
    
    return teachers

@app.post("/admin/teachers/", response_model=schemas.Teacher, status_code=201)
async def create_new_teacher(
    name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    shift: str = Form(...),
    gender: str = Form(...),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
    background_tasks: BackgroundTasks = None,
    whatsapp_number: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    cv: Optional[UploadFile] = File(None)
):
    # Initialize background tasks if not provided
    if background_tasks is None:
        background_tasks = BackgroundTasks()
    
    if current_admin.role != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    
    db_teacher = crud.get_teacher_by_email(db, email=email)
    if db_teacher:
        raise HTTPException(status_code=400, detail="A teacher with this email already exists.")
    
    # Handle file uploads
    photo_url = None
    cv_url = None
    
    if photo:
        photo_url = await file_handler.save_teacher_photo(photo)
    
    if cv:
        cv_url = await file_handler.save_teacher_cv(cv)
    
    # Create teacher data object
    teacher_data = schemas.TeacherCreate(
        name=name,
        email=email,
        phone_number=phone_number,
        whatsapp_number=whatsapp_number,
        shift=shift,
        gender=gender,
        profile_photo_url=photo_url,
        cv_url=cv_url
    )
    
    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for i in range(10))
    new_teacher = crud.create_teacher(db=db, teacher=teacher_data, password=temp_password)
    background_tasks.add_task(email_sender.send_teacher_credentials_email, teacher_data=schemas.Teacher.from_orm(new_teacher).model_dump(), temp_password=temp_password)
    return new_teacher

@app.delete("/admin/teachers/{teacher_id}", response_model=schemas.Teacher)
def delete_a_teacher(teacher_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.role != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    db_teacher = crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    
    # Delete associated files if they exist
    if db_teacher.profile_photo_url:
        file_handler.delete_teacher_photo(db_teacher.profile_photo_url)
    if db_teacher.cv_url:
        file_handler.delete_teacher_cv(db_teacher.cv_url)
    
    crud.delete_teacher(db=db, teacher_id=teacher_id)
    return db_teacher

@app.get("/teacher/me", response_model=schemas.TeacherWithStudents)
def get_teacher_me(
    current_user: models.Teacher = Depends(get_current_admin)
):
    """Gets the data for the currently logged-in teacher."""
    if not hasattr(current_user, 'role') or current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Forbidden: Access denied for this role.")
    
    # Because we updated the crud function, current_user is already
    # the full teacher object with students and schedules pre-loaded.
    return current_user

# --- Student Endpoints ---

@app.get("/admin/students/", response_model=list[schemas.Application])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    students = crud.get_applications(db, skip=skip, limit=limit)
    #for student in students:
        #print(f"DEBUG: Student ID {student.id}, Teacher Object: {student.teacher}")
    return students

@app.post("/admin/add-student/", response_model=schemas.Application, status_code=201)
def add_student_by_admin(application: schemas.ApplicationCreate, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    db_application = crud.get_application_by_email(db, email=application.email)
    if db_application:
        raise HTTPException(status_code=400, detail="A student with this email address already exists.")
    new_student = crud.create_application(db=db, application=application)
    return new_student

@app.patch("/admin/students/{student_id}/assign", response_model=schemas.Application)
def assign_student(student_id: int, assignment: schemas.StudentAssign, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    db_student = crud.get_application_by_id(db, application_id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student application not found.")
    db_teacher = crud.get_teacher(db, teacher_id=assignment.teacher_id)
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    updated_student = crud.assign_teacher_and_shift(db=db, student_id=student_id, teacher_id=assignment.teacher_id, shift=assignment.shift)
    return updated_student

# --- Dashboard Stats Endpoint ---

@app.get("/admin/dashboard-stats/")
def get_dashboard_stats(db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    total_students = db.query(models.Application).count()
    total_teachers = db.query(models.Teacher).count()
    unassigned_students = db.query(models.Application).filter(models.Application.teacher_id == None, models.Application.status == 'Approved').count()
    pending_applications = db.query(models.Application).filter(models.Application.status == 'Pending').count()
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "unassigned_students": unassigned_students,
        "pending_applications": pending_applications,
    }

# --- Attendance Endpoints ---

@app.get("/admin/attendance/", response_model=List[schemas.Attendance])
def read_attendance_records(
    teacher_id: int,
    class_date: date,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Retrieves attendance records for a given teacher and date.
    e.g., /admin/attendance/?teacher_id=1&class_date=2025-10-06
    """
    attendance_records = crud.get_attendance_for_teacher_by_date(
        db=db, teacher_id=teacher_id, class_date=class_date
    )
    return attendance_records

@app.post("/admin/attendance/", response_model=schemas.Attendance, status_code=201)
def mark_student_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Creates a new attendance record for a student."""
    # Check if attendance for this student on this date has already been marked
    existing_record = crud.get_attendance_record(
        db=db, student_id=attendance.student_id, class_date=attendance.class_date
    )
    if existing_record:
        raise HTTPException(
            status_code=400, 
            detail="Attendance has already been marked for this student on this date."
        )
    
    return crud.create_attendance_record(db=db, attendance=attendance)

# --- Schedule Endpoints ---
@app.post("/admin/schedules/", response_model=schemas.Schedule, status_code=201)
def create_new_schedule(
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Creates a new class schedule for a teacher and student."""
    # Optional: Add validation to ensure the admin is allowed to schedule this teacher
    
    # Check if student and teacher exist
    db_student = crud.get_application_by_id(db, application_id=schedule.student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found.")
    
    db_teacher = crud.get_teacher(db, teacher_id=schedule.teacher_id)
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    # In the future, we can add a check here to prevent scheduling conflicts

    return crud.create_schedule(db=db, schedule=schedule)

# --- Session Attendance Endpoints ---

@app.get("/admin/session-attendance/", response_model=list[schemas.Attendance])
def read_session_attendance(
    teacher_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Retrieves session attendance records for a teacher within a date range.
    e.g., /admin/session-attendance/?teacher_id=1&start_date=2025-10-26&end_date=2025-11-01
    """
    session_attendances = db.query(models.Attendance).join(
        models.Schedule, models.Attendance.schedule_id == models.Schedule.id
    ).filter(
        models.Schedule.teacher_id == teacher_id,
        models.Attendance.class_date >= start_date,
        models.Attendance.class_date <= end_date,
        models.Attendance.schedule_id != None
    ).all()
    return session_attendances

@app.post("/admin/session-attendance/", response_model=schemas.Attendance, status_code=201)
def create_session_attendance(
    attendance: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Creates a new session attendance record using the unified Attendance model."""
    # Validate that the schedule exists
    if attendance.schedule_id:
        db_schedule = db.query(models.Schedule).filter(
            models.Schedule.id == attendance.schedule_id
        ).first()
        if not db_schedule:
            raise HTTPException(status_code=404, detail="Schedule not found.")
    
    # Check if attendance for this session on this date already exists
    if attendance.schedule_id:
        existing_record = crud.get_session_attendance_by_schedule_and_date(
            db=db, schedule_id=attendance.schedule_id, class_date=attendance.class_date
        )
        if existing_record:
            raise HTTPException(
                status_code=400,
                detail="Attendance has already been marked for this session on this date."
            )
    
    return crud.create_attendance_record(db=db, attendance=attendance)

@app.get("/admin/attendance-count/")
def get_attendance_count(
    teacher_id: int,
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Gets attendance count summary for a teacher and all their students for a specific month.
    e.g., /admin/attendance-count/?teacher_id=1&year=2025&month=10
    """
    return crud.get_attendance_count_by_month(db, teacher_id=teacher_id, year=year, month=month)