# schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Pydantic models define the shape of the data for your API.
# They handle validation, serialization, and documentation automatically.

class ApplicationBase(BaseModel):
    """
    Base schema with fields common to both creating and reading applications.
    This matches the fields in your frontend form.
    """
    first_name: str
    last_name: str
    email: EmailStr # Pydantic validates that this is a valid email format
    phone_number: str
    country: str
    preferred_course: str
    
    # --- IMPROVEMENT: Added Validation ---
    # The age is still required, but now we also ensure it's a positive number.
    # `gt=0` means "greater than 0".
    age: int = Field(..., gt=0, description="The applicant's age must be a positive number.")

    previous_experience: Optional[str] = None
    learning_goals: Optional[str] = None
    parent_name: str
    relationship: str
    gender: str
    whatsapp_number: Optional[str] = None # This field is optional


class ApplicationCreate(ApplicationBase):
    """
    Schema used for creating a new application.
    It receives data from the frontend POST request.
    """
    pass # Inherits all fields from ApplicationBase

class Application(ApplicationBase):
    """
    Schema used for reading/returning an application from the API.
    It includes database-generated fields like 'id' and 'created_at'.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        # This tells Pydantic to read data from ORM models (SQLAlchemy objects)
        # and not just from dictionaries. It's crucial for converting DB objects
        # to JSON responses.
        from_attributes = True
