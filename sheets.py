# sheets.py

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import json
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- Configuration ---
SCOPE = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
]
CREDS_FILE = 'credentials.json'

# --- Use Environment Variable for Sheet ID ---
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
WORKSHEET_NAME = 'Sheet1'


def append_to_sheet(application_data: dict):
    """
    Appends a new row with application data to the Google Sheet.
    """
    # --- STEP 1: ADD MORE LOGGING ---
    print("--- [SHEETS] Task started. ---")

    if not SHEET_ID:
        print("--- [SHEETS] ERROR: GOOGLE_SHEET_ID not found in environment variables. Cannot write to sheet.")
        return False

    print(f"--- [SHEETS] Using Sheet ID: {SHEET_ID}")

    try:
        print("--- [SHEETS] Attempting to authorize with credentials...")
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPE)
        client = gspread.authorize(creds)
        print("--- [SHEETS] Authorization successful.")

        print("--- [SHEETS] Opening spreadsheet by key...")
        spreadsheet = client.open_by_key(SHEET_ID)
        print("--- [SHEETS] Spreadsheet opened successfully.")

        print(f"--- [SHEETS] Opening worksheet: {WORKSHEET_NAME}...")
        worksheet = spreadsheet.worksheet(WORKSHEET_NAME)
        print("--- [SHEETS] Worksheet opened successfully.")

        # Match the order of columns in your Google Sheet
        print("--- [SHEETS] Preparing row data...")
        row = [
            application_data.get('id', ''),
            str(application_data.get('created_at', str(datetime.now()))),
            application_data.get('first_name', ''),
            application_data.get('last_name', ''),
            application_data.get('gender', ''),
            application_data.get('age', ''),
            application_data.get('email', ''),
            application_data.get('phone_number', ''),
            application_data.get('whatsapp_number', ''),
            application_data.get('country', ''),
            application_data.get('parent_name', ''),
            application_data.get('relationship', ''),
            application_data.get('preferred_course', ''),
            application_data.get('previous_experience', ''),
            application_data.get('learning_goals', '')
        ]
        print(f"--- [SHEETS] Row data prepared: {row}")
        
        print("--- [SHEETS] Appending row to sheet...")
        worksheet.append_row(row)
        print(f"--- [SHEETS] SUCCESS: Successfully wrote application ID {application_data.get('id')} to Google Sheet.")
        return True

    # --- STEP 2: CATCH SPECIFIC ERRORS ---
    except gspread.exceptions.SpreadsheetNotFound:
        print(f"--- [SHEETS] FATAL ERROR: Spreadsheet not found. Check SHEET_ID and sharing permissions.")
        return False
    except gspread.exceptions.WorksheetNotFound:
        print(f"--- [SHEETS] FATAL ERROR: Worksheet '{WORKSHEET_NAME}' not found.")
        return False
    except Exception as e:
        # This will print the exact error message to our log
        print(f"--- [SHEETS] A FATAL UNEXPECTED ERROR occurred: {e}")
        # Also print the type of error for more detail
        print(f"--- [SHEETS] Error Type: {type(e)}")
        return False
