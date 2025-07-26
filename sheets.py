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
CREDS_FILE = 'credentials.json' # Your Google service account file

# --- IMPROVEMENT: Use Environment Variable for Sheet ID ---
# Avoid hardcoding IDs. This makes it easier to switch to a different sheet
# for testing or a new version without changing the code.
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
WORKSHEET_NAME = 'Sheet1'


def append_to_sheet(application_data: dict):
    """
    Appends a new row with application data to the Google Sheet.
    """
    if not SHEET_ID:
        print("ERROR: GOOGLE_SHEET_ID not found in environment variables. Cannot write to sheet.")
        return False

    print("--- Attempting to write to Google Sheet ---")
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPE)
        client = gspread.authorize(creds)
        spreadsheet = client.open_by_key(SHEET_ID)
        worksheet = spreadsheet.worksheet(WORKSHEET_NAME)

        # --- FIX: Match the order of columns in your Google Sheet ---
        # The keys used here (e.g., 'gender', 'whatsapp_number') now correctly
        # match the data being passed from main.py.
        # IMPORTANT: Ensure this order exactly matches your Google Sheet columns.
        row = [
            application_data.get('id', ''),
            application_data.get('created_at', str(datetime.now())),
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
        
        print(f"Appending row for application ID {application_data.get('id')}...")
        worksheet.append_row(row)
        print("Successfully wrote to Google Sheet.")
        return True

    except gspread.exceptions.SpreadsheetNotFound:
        print(f"ERROR: Spreadsheet not found. Check SHEET_ID and sharing permissions.")
        return False
    except gspread.exceptions.WorksheetNotFound:
        print(f"ERROR: Worksheet '{WORKSHEET_NAME}' not found.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred with Google Sheets: {e}")
        return False
