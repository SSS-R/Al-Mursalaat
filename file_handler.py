# file_handler.py
import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException

# Define base directory for file storage
BASE_DIR = Path(__file__).parent
PHOTO_DIR = BASE_DIR / "Frontend" / "public" / "bucket" / "teacherImg"
CV_DIR = BASE_DIR / "Frontend" / "public" / "bucket" / "CV"

# Create directories if they don't exist
PHOTO_DIR.mkdir(parents=True, exist_ok=True)
CV_DIR.mkdir(parents=True, exist_ok=True)

print(f"[FILE_HANDLER] Photo directory: {PHOTO_DIR}")
print(f"[FILE_HANDLER] CV directory: {CV_DIR}")


async def save_teacher_photo(file: UploadFile) -> str:
    """
    Saves a teacher photo file and returns the relative URL path.
    
    Args:
        file: UploadFile object from FastAPI
        
    Returns:
        str: Relative URL path to the saved file (e.g., "/bucket/teacherImg/filename.jpg")
        
    Raises:
        HTTPException: If file type is invalid or file size exceeds 5MB
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Photo must be an image file")
    
    # Validate file size (5MB = 5242880 bytes)
    file_content = await file.read()
    if len(file_content) > 5242880:
        raise HTTPException(status_code=400, detail="Photo must be 5MB or smaller")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Save file
    file_path = PHOTO_DIR / unique_filename
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return relative URL path
    return f"/bucket/teacherImg/{unique_filename}"


async def save_teacher_cv(file: UploadFile) -> str:
    """
    Saves a teacher CV file and returns the relative URL path.
    
    Args:
        file: UploadFile object from FastAPI
        
    Returns:
        str: Relative URL path to the saved file (e.g., "/bucket/CV/filename.pdf")
        
    Raises:
        HTTPException: If file type is not PDF or file size exceeds 10MB
    """
    # Validate file type
    if not file.content_type or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="CV must be a PDF file")
    
    # Validate file size (10MB = 10485760 bytes)
    file_content = await file.read()
    if len(file_content) > 10485760:
        raise HTTPException(status_code=400, detail="CV must be 10MB or smaller")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}.pdf"
    
    # Save file
    file_path = CV_DIR / unique_filename
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return relative URL path
    return f"/bucket/CV/{unique_filename}"


def delete_teacher_photo(photo_url: str) -> bool:
    """
    Deletes a teacher photo file.
    
    Args:
        photo_url: Relative URL path to the file
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    if not photo_url:
        return False
    
    try:
        filename = photo_url.split("/")[-1]
        file_path = PHOTO_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return True
    except Exception:
        pass
    
    return False


def delete_teacher_cv(cv_url: str) -> bool:
    """
    Deletes a teacher CV file.
    
    Args:
        cv_url: Relative URL path to the file
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    if not cv_url:
        return False
    
    try:
        filename = cv_url.split("/")[-1]
        file_path = CV_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return True
    except Exception:
        pass
    
    return False
