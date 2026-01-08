# schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time

# --- Course Schemas (New) ---

class CourseBase(BaseModel):
    name: str # e.g. "Quran Reading (Nazra)"
    description: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Base Schemas (No dependencies on other schemas) ---

class ApplicationBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    country: str
    state: Optional[str]= None
    preferred_course: str
    course_id: Optional[int]= None
    age: int = Field(..., gt=0)
    previous_experience: Optional[str] = None
    learning_goals: Optional[str] = None
    parent_name: Optional[str] = None
    relationship_with_student: Optional[str]=None
    gender: str
    whatsapp_number: Optional[str] = None
    shift: Optional[str] = None
    status: Optional[str] = "Pending"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    gender: str
    whatsapp_number: Optional[str] = None

class TeacherBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    whatsapp_number: Optional[str] = None
    shift: str
    gender: str
    profile_photo_url: Optional[str] = None
    cv_url: Optional[str] = None

# --- Schedule Schemas ---

class ScheduleBase(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time
    student_id: int
    teacher_id: int
    zoom_link: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    zoom_link: Optional[str] = None
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None
class Schedule(ScheduleBase):
    id: int
    student: 'Application'
    class Config:
        from_attributes = True


# --- Attendance Schemas ---

class AttendanceBase(BaseModel):
    class_date: date
    status: str  
    student_id: int
    teacher_id: int
    schedule_id: Optional[int] = None 
    teacher_status: Optional[str] = None 
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    teacher_status: Optional[str] = None
    notes: Optional[str] = None

class Attendance(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Schemas for Creating New Objects ---

class ApplicationCreate(ApplicationBase):
    pass

class UserCreate(UserBase):
    role: str = "admin"

class TeacherCreate(TeacherBase):
    pass

# --- Schemas for API Responses (with relationships) ---

class User(UserBase):
    id: int
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Teacher(TeacherBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Application(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    # This tells Pydantic to expect a nested Teacher object.
    # The string 'Teacher' is a "forward reference" to prevent errors.
    teacher: Optional['Teacher'] = None
    class Config:
        from_attributes = True

class TeacherWithStudents(Teacher):
    # This tells Pydantic to expect a nested list of Application objects.
    students: List['Application'] = []
    schedules: List['Schedule']
    class Config:
        from_attributes = True

class AttendanceStats(BaseModel):
    # e.g. { "Quran Nazra": {"Present": 5, "Late": 0}, "Memorization": {"Present": 8} }
    teacher_by_course: Dict[str, Dict[str, int]] 
    # Detailed student stats
    students: Dict[str, Any]


# --- Schemas for Specific Actions ---
class StudentAssign(BaseModel):
    teacher_id: int
    shift: str
    
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class ForgetPasswordRequest(BaseModel):
    email:EmailStr

# --- Resolve Forward References ---


# This is a crucial step that allows the schemas to refer to each other.
Application.model_rebuild()
TeacherWithStudents.model_rebuild()
Schedule.model_rebuild()
