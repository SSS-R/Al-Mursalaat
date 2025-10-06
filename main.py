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
import secrets
import string

import crud
import models
import schemas
from database import SessionLocal, engine
import sheets
import email_sender

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
        if role not in ["admin", "supreme-admin", "teacher"]: # Added 'teacher' for future use
            raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions.")
        return payload
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

# --- Admin/User Endpoints ---

@app.get("/admin/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.post("/admin/create-admin/", response_model=schemas.User, status_code=201)
def create_admin_user(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("role") != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="An admin with this email already exists.")
    alphabet = string.ascii_letters + string.digits + string.punctuation
    temp_password = ''.join(secrets.choice(alphabet) for i in range(12))
    new_user = crud.create_user(db=db, user=user, password=temp_password)
    background_tasks.add_task(email_sender.send_admin_credentials_email, admin_data=schemas.User.from_orm(new_user).model_dump(), temp_password=temp_password)
    return new_user

@app.delete("/admin/users/{user_id}", response_model=schemas.User)
def delete_admin_user(user_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("role") != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    user_to_delete = crud.get_user(db, user_id=user_id)
    if user_to_delete is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if user_to_delete.email == current_admin.get("email"):
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
    # 1. Get the current user's email from the security token
    user_email = current_admin.get("email")
    
    # 2. Fetch the user's full record from the database
    db_user = crud.get_user_by_email(db, email=user_email)
    if not db_user:
        # This should theoretically never happen if the token is valid
        raise HTTPException(status_code=404, detail="User not found.")

    # 3. Verify that the "current_password" they provided is correct
    if not crud.verify_password(password_data.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")

    # 4. If correct, update the database with the new password
    crud.update_user_password(db, user_id=db_user.id, new_password=password_data.new_password)
    
    return {"message": "Password updated successfully."}

# --- Teacher Endpoints ---

@app.get("/admin/teachers/", response_model=list[schemas.TeacherWithStudents])
def read_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    teachers = crud.get_teachers(db, skip=skip, limit=limit)
    return teachers

@app.post("/admin/teachers/", response_model=schemas.Teacher, status_code=201)
def create_new_teacher(teacher: schemas.TeacherCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("role") != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    db_teacher = crud.get_teacher_by_email(db, email=teacher.email)
    if db_teacher:
        raise HTTPException(status_code=400, detail="A teacher with this email already exists.")
    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for i in range(10))
    new_teacher = crud.create_teacher(db=db, teacher=teacher, password=temp_password)
    background_tasks.add_task(email_sender.send_teacher_credentials_email, teacher_data=schemas.Teacher.from_orm(new_teacher).model_dump(), temp_password=temp_password)
    return new_teacher

@app.delete("/admin/teachers/{teacher_id}", response_model=schemas.Teacher)
def delete_a_teacher(teacher_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("role") != "supreme-admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions.")
    db_teacher = crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    crud.delete_teacher(db=db, teacher_id=teacher_id)
    return db_teacher

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

