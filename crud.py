# crud.py
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload
import models
import schemas
from datetime import datetime, date

# CRUD (Create, Read, Update, Delete) functions interact directly with the database.

pwd_context= CryptContext(schemes=["bcrypt"], deprecated= "auto")

def get_password_hash(password):
    password_bytes = password.encode('utf-8')
    # Truncate character by character to avoid breaking multi-byte characters
    while len(password_bytes) > 72:
        password = password[:-1]
        password_bytes = password.encode('utf-8')
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a hashed password."""
    # Truncate the plain password the same way before verification
    password_bytes = plain_password.encode('utf-8')
    while len(password_bytes) > 72:
        plain_password = plain_password[:-1]
        password_bytes = plain_password.encode('utf-8')
    return pwd_context.verify(plain_password, hashed_password)

def update_password(db: Session, user_obj, new_password: str):
    """Updates the password for a given user or teacher object."""
    new_hashed_password = get_password_hash(new_password)
    user_obj.hashed_password = new_hashed_password
    db.commit()
    return user_obj

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

# --- COURSE CRUD (NEW) ---
def create_course(db: Session, course: schemas.CourseCreate):
    """Creates one of the 4 course types."""
    db_course = models.Course(**course.model_dump())
    db.add(db_course); db.commit(); db.refresh(db_course); return db_course

def get_courses(db: Session):
    return db.query(models.Course).all()

def get_course_by_name(db: Session, name: str):
    # Case insensitive search to match "Quran Reading" with "quran reading"
    return db.query(models.Course).filter(models.Course.name.ilike(name)).first()

def get_application_by_email(db: Session, email: str):
    """
    Queries the database for an application with a specific email address.
    """
    return db.query(models.Application).filter(models.Application.email == email).first()

def create_application(db: Session, application: schemas.ApplicationCreate):
    app_data = application.model_dump()
    
    # Logic: If the string entered in "preferred_course" matches a Course in our DB,
    # we link the ID. This "connects" the text to the system.
    if application.preferred_course:
        course = get_course_by_name(db, application.preferred_course)
        if course:
            app_data['course_id'] = course.id
            
    db_application = models.Application(**app_data)
    db.add(db_application); db.commit(); db.refresh(db_application); return db_application

def get_user_by_email(db: Session, email: str):
    """Queries the database for a user with a specific email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves all user records from the database with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
    """Queries the database for a user with a specific ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def delete_user(db: Session, user_id: int):
    """Deletes a user from the database by their ID."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# --- Teacher CRUD Functions ---

def get_teacher(db: Session, teacher_id: int):
    """Queries for a single teacher by their ID."""
    return db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()

def get_teacher_by_email(db: Session, email: str):
    """Queries for a single teacher by their email."""
    return db.query(models.Teacher).filter(models.Teacher.email == email).first()

def get_teachers(db: Session, skip: int = 0, limit: int = 100):
    """Retrieves all teacher records."""
    return db.query(models.Teacher).offset(skip).limit(limit).all()

def create_teacher(db: Session, teacher: schemas.TeacherCreate, password: str):
    """Creates a new teacher record in the database with a hashed password."""
    hashed_password = get_password_hash(password)
    db_teacher = models.Teacher(
        **teacher.model_dump(),
        hashed_password=hashed_password
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def delete_teacher(db: Session, teacher_id: int):
    """Deletes a teacher from the database by their ID."""
    db_teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if db_teacher:
        db.delete(db_teacher)
        db.commit()
    return db_teacher

def assign_teacher_and_shift(db: Session, student_id: int, teacher_id: int, shift: str):
    """Assigns a teacher and shift to a student and updates their status to 'Approved'."""
    db_student = db.query(models.Application).filter(models.Application.id == student_id).first()
    if db_student:
        db_student.teacher_id = teacher_id
        db_student.shift = shift
        db_student.status = "Approved"
        db.commit()
        db.refresh(db_student)
    return db_student

def get_application_by_id(db: Session, application_id: int):
    """Queries for a single application by its ID."""
    return db.query(models.Application).filter(models.Application.id == application_id).first()

def get_applications(db, skip=0, limit=100): 
    # Eager load the course so frontend can see the official course details
    return db.query(models.Application).options(
        joinedload(models.Application.teacher), joinedload(models.Application.course)
    ).offset(skip).limit(limit).all()

def get_teachers_by_gender(db: Session, gender: str, skip: int = 0, limit: int = 100):
    """Retrieves all teacher records of a specific gender."""
    return db.query(models.Teacher).filter(models.Teacher.gender == gender).offset(skip).limit(limit).all()

# --- Attendance CRUD Functions ---

def get_attendance_for_teacher_by_date(db: Session, teacher_id: int, class_date: date):
    """Retrieves all attendance records for a specific teacher on a specific date."""
    return db.query(models.Attendance).filter(
        models.Attendance.teacher_id == teacher_id,
        models.Attendance.class_date == class_date
    ).all()

def get_attendance_record(db: Session, student_id: int, class_date: date):
    """Checks if an attendance record already exists for a student on a specific date."""
    return db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id,
        models.Attendance.class_date == class_date
    ).first()

def create_attendance_record(db: Session, attendance: schemas.AttendanceCreate):
    """Creates a new attendance record."""
    db_attendance = models.Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def authenticate_user(db: Session, email: str, password: str):
    """Finds a user/teacher by email and verifies their password."""
    user = get_user_or_teacher_by_email(db, email=email) # Use the new generic function
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_user_or_teacher_by_email(db: Session, email: str):
    """Checks both the users and teachers table for a matching email."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user

    # Eagerly load students, schedules, and the student for each schedule
    teacher = db.query(models.Teacher).filter(models.Teacher.email == email).options(
        joinedload(models.Teacher.students),
        joinedload(models.Teacher.schedules).joinedload(models.Schedule.student)
    ).first()
    return teacher

def create_schedule(db: Session, schedule: schemas.ScheduleCreate):
    """Creates a new schedule record in the database."""
    db_schedule = models.Schedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule_id: int, schedule_update: schemas.ScheduleUpdate):
    """
    Patches a schedule. If admin sends only 'start_time', only that is updated.
    """
    db_schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not db_schedule: return None
    
    # Only update provided fields (exclude_unset=True)
    update_data = schedule_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_schedule, key, value)
        
    db.commit(); db.refresh(db_schedule)
    return db_schedule

# --- Session Attendance CRUD Functions (using unified Attendance model) ---

def create_session_attendance(db: Session, schedule_id: int, class_date: date, teacher_status: str, student_status: str, student_id: int, teacher_id: int):
    """Creates a new session attendance record using the unified Attendance model."""
    db_attendance = models.Attendance(
        schedule_id=schedule_id,
        class_date=class_date,
        teacher_status=teacher_status,
        status=student_status,  # Map to status field
        student_id=student_id,
        teacher_id=teacher_id
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_session_attendance_by_schedule_and_date(db: Session, schedule_id: int, class_date: date):
    """Gets session attendance for a specific schedule on a specific date."""
    return db.query(models.Attendance).filter(
        models.Attendance.schedule_id == schedule_id,
        models.Attendance.class_date == class_date
    ).first()

def get_attendance_count_by_month(db: Session, teacher_id: int, year: int, month: int):
    """
    Groups attendance by COURSE NAME.
    Returns format: 
    { "teacher_by_course": { "Quran Nazra": {"Present": 5, "Late": 0} } }
    """
    from datetime import datetime as dt
    import calendar
    
    first = dt(year, month, 1).date()
    last = dt(year, month, calendar.monthrange(year, month)[1]).date()
    
    # Fetch attendance, joined with Student and their Course
    records = db.query(models.Attendance).join(models.Application).outerjoin(models.Course).filter(
        models.Attendance.teacher_id==teacher_id, 
        models.Attendance.class_date>=first, 
        models.Attendance.class_date<=last
    ).options(
        joinedload(models.Attendance.student).joinedload(models.Application.course)
    ).all()
    
    course_counts = {}
    student_counts = {}
    
    for r in records:
        # Determine Course Name for this record
        # Priority: 1. Linked Course Name, 2. Text in 'preferred_course', 3. "Unknown"
        c_name = "Unknown"
        if r.student:
            if r.student.course:
                c_name = r.student.course.name
            elif r.student.preferred_course:
                c_name = r.student.preferred_course
            
        # Initialize bucket for this course if not exists
        if c_name not in course_counts:
            course_counts[c_name] = {"Present": 0, "Absent": 0, "Late": 0}
            
        # Increment counts based on teacher_status (Present/Late/Absent)
        t_status = r.teacher_status
        if t_status:
            # Handle standard statuses, or create new key if status is custom
            current_val = course_counts[c_name].get(t_status, 0)
            course_counts[c_name][t_status] = current_val + 1
            
        # Student Stats (For detailed history)
        s_key = f"{r.student_id}"
        if s_key not in student_counts:
            student_counts[s_key] = {"student": r.student, "counts": {}}
        if r.status:
            student_counts[s_key]["counts"][r.status] = student_counts[s_key]["counts"].get(r.status, 0) + 1
            
    return {"teacher_by_course": course_counts, "students": student_counts}