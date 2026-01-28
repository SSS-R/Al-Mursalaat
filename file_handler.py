import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

# Define storage directories
UPLOADS_DIR = Path("uploads")
TEACHER_PHOTOS_DIR = UPLOADS_DIR / "teacher_photos"
TEACHER_CVS_DIR = UPLOADS_DIR / "teacher_cvs"

# Ensure directories exist
TEACHER_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
TEACHER_CVS_DIR.mkdir(parents=True, exist_ok=True)

ADMIN_PHOTOS_DIR = UPLOADS_DIR / "admin_photos"
ADMIN_CVS_DIR = UPLOADS_DIR / "admin_cvs"
ADMIN_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
ADMIN_CVS_DIR.mkdir(parents=True, exist_ok=True)

async def _save_file_locally(file: UploadFile, directory: Path, subdir_name: str) -> str:
    """
    Saves a file locally with a unique name and returns the static URL.
    """
    try:
        # Generate unique filename
        # Preserve original extension
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        file_path = directory / unique_filename
        
        # Reset file pointer to the beginning to ensure we don't save an empty file
        file.file.seek(0)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return URL (mapped to /static in main.py)
        # URL format: /static/subdir_name/filename
        return f"/static/{subdir_name}/{unique_filename}"
        
    except Exception as e:
        print(f"Error saving file locally: {e}")
        return None

async def save_teacher_photo(file: UploadFile) -> str:
    """
    Saves a teacher photo locally and returns the URL.
    """
    return await _save_file_locally(file, TEACHER_PHOTOS_DIR, "teacher_photos")

async def save_teacher_cv(file: UploadFile) -> str:
    """
    Saves a teacher CV locally and returns the URL.
    """
    return await _save_file_locally(file, TEACHER_CVS_DIR, "teacher_cvs")

async def save_admin_photo(file: UploadFile) -> str:
    """
    Saves an admin photo locally and returns the URL.
    """
    return await _save_file_locally(file, ADMIN_PHOTOS_DIR, "admin_photos")

async def save_admin_cv(file: UploadFile) -> str:
    """
    Saves an admin CV locally and returns the URL.
    """
    return await _save_file_locally(file, ADMIN_CVS_DIR, "admin_cvs")

def delete_teacher_photo(photo_url: str):
    """
    Deletes the teacher photo from local storage.
    Expects URL like: /static/teacher_photos/uuid.jpg
    """
    _delete_file_locally(photo_url)

def delete_teacher_cv(cv_url: str):
    """
    Deletes the teacher CV from local storage.
    Expects URL like: /static/teacher_cvs/uuid.pdf
    """
    _delete_file_locally(cv_url)

def _delete_file_locally(file_url: str):
    if not file_url:
        return
        
    try:
        # Extract relative path from URL
        # Assumption: URL starts with /static/
        if file_url.startswith("/static/"):
            relative_path = file_url.replace("/static/", "", 1)
            # Prevent directory traversal attacks (basic check)
            if ".." in relative_path:
                print(f"Security Warning: Attempted directory traversal in delete: {file_url}")
                return
                
            file_path = UPLOADS_DIR / relative_path
            
            if file_path.exists():
                os.remove(file_path)
                print(f"Deleted local file: {file_path}")
            else:
                print(f"File not found for deletion: {file_path}")
        else:
            print(f"URL does not match local storage pattern: {file_url}")
            
    except Exception as e:
        print(f"Error deleting local file: {e}")
