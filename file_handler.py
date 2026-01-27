import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

# 1. Configure Cloudinary
# It automatically picks up the variables from your .env file
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

async def save_teacher_photo(file: UploadFile) -> str:
    """
    Uploads a photo to Cloudinary and returns the public URL.
    """
    try:
        # We pass the file object directly to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="teacher_photos",  # This creates a folder in your Cloudinary
            resource_type="image",
            type="upload",
            access_mode="public"
        )
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Error uploading photo to Cloudinary: {e}")
        return None

async def save_teacher_cv(file: UploadFile) -> str:
    """
    Uploads a CV (PDF) to Cloudinary and returns the public URL.
    """
    try:
        # 'auto' resource_type detects if it is a PDF or image
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="teacher_cvs",
            resource_type="auto",
            type="upload",
            access_mode="public"
        )
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Error uploading CV to Cloudinary: {e}")
        return None

def _get_cloudinary_public_id_and_type(url: str):
    """
    Parses a Cloudinary URL to extract the public_id and the resource_type.
    
    Expected format: 
    https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<folder>/<filename>
    or
    https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/<folder>/<filename>
    
    Returns:
        (public_id, resource_type) or (None, None)
    """
    if not url:
        return None, None
        
    try:
        # Example URL: https://res.cloudinary.com/demo/image/upload/v12345/teacher_photos/abc.jpg
        # specific structure parts
        parts = url.split("/")
        
        # Determine resource_type (usually index 4 if standard, but safer to look for 'upload')
        if "upload" not in parts:
            return None, None
            
        upload_index = parts.index("upload")
        
        # resource_type should be before 'upload' (e.g., 'image', 'raw', 'video')
        # .../image/upload/... -> resource_type = image
        # .../raw/upload/...   -> resource_type = raw
        resource_type = parts[upload_index - 1]
        
        # public_id is everything after the version (v12345) or after 'upload' if no version
        # It includes the folder structure but NOT the extension (for images) or WITH extension (for raw sometimes, dependent on config)
        
        # Let's rebuild the path after 'upload'
        path_remainder = parts[upload_index+1:]
        
        # Remove version if present (starts with 'v' and is numeric)
        if path_remainder and path_remainder[0].startswith("v") and path_remainder[0][1:].isdigit():
            path_remainder.pop(0)
            
        # Rejoin to get full path: "teacher_photos/abc.jpg"
        full_filename = "/".join(path_remainder)
        
        # For 'image' and 'video', public_id does NOT include extension.
        # For 'raw', it usually DOES include extension, but Cloudinary API destroy can be tricky.
        # Standardize: remove extension for image/video. Keep for raw? 
        # Actually, Cloudinary python SDK usually expects public_id without extension for images,
        # but WITH extension for raw files if they were uploaded with one.
        
        if resource_type in ["image", "video"]:
            public_id = full_filename.rsplit(".", 1)[0]
        else:
            # For raw files, the public_id usually includes the extension if it was preserved.
            # However, simpler to try both or rely on how we uploaded it.
            # In save_teacher_cv, we used 'auto'. If it became 'image', it behaves like image.
            # If it became 'raw', it keeps extension.
            # Safe bet: Try to strip extension for consistency if it acts weird, 
            # but usually raw files in Cloudinary include extension in ID.
            # Let's rely on standard logic: raw files often need full filename as public_id.
            public_id = full_filename

        return public_id, resource_type
        
    except Exception as e:
        print(f"Error parsing Cloudinary URL '{url}': {e}")
        return None, None

def delete_teacher_photo(photo_url: str):
    """
    Deletes the teacher photo.
    """
    if not photo_url:
        return

    try:
        public_id, resource_type = _get_cloudinary_public_id_and_type(photo_url)
        if public_id and resource_type:
            # Force 'image' if we are sure it's a photo, but relying on URL analysis is safer.
            # If URL says 'raw', we shouldn't pass 'image'.
            cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            print(f"Deleted photo: {public_id} [{resource_type}]")
        else:
             print(f"Could not parse URL for deletion: {photo_url}")
             
    except Exception as e:
        print(f"Error deleting photo from Cloudinary: {e}")

def delete_teacher_cv(cv_url: str):
    """
    Deletes the teacher CV (PDF/Image).
    """
    if not cv_url:
        return

    try:
        public_id, resource_type = _get_cloudinary_public_id_and_type(cv_url)
        if public_id and resource_type:
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            print(f"Deleted CV: {public_id} [{resource_type}] Result: {result}")
            
            # Fallback: specific case where raw files might be tricky with extensions
            # If we tried 'raw' and it failed (result not 'ok'), maybe try without extension?
            # Or if we parsed 'image' but it was 'raw'?
            # The URL parser is the source of truth.
        else:
            print(f"Could not parse URL for deletion: {cv_url}")

    except Exception as e:
        print(f"Error deleting CV from Cloudinary: {e}")
