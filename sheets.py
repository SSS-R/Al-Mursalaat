# sheets.py

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import json

# --- Configuration ---
SCOPE = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
]
CREDS_FILE = 'credentials.json'
# TODO: Replace with the actual ID of your Google Sheet
SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_GOES_HERE' 
WORKSHEET_NAME = 'Sheet1'


def append_to_sheet(application_data: dict):
    """
    Appends a new row with application data to the Google Sheet.
    """
    print("--- Attempting to write to Google Sheet using ID ---")
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPE)
        client = gspread.authorize(creds)
        spreadsheet = client.open_by_key(SHEET_ID)
        worksheet = spreadsheet.worksheet(WORKSHEET_NAME)

        # --- UPDATED ROW DATA ---
        # The order here MUST match the column order in your Google Sheet.
        print("Preparing row data...")
        row = [
            application_data.get('id', ''),
            str(application_data.get('created_at', datetime.now())),
            application_data.get('first_name', ''),
            application_data.get('last_name', ''),
            application_data.get('gender', ''), # New field
            application_data.get('age', ''),
            application_data.get('email', ''),
            application_data.get('phone_number', ''),
            application_data.get('whatsapp_number', ''), # New field
            application_data.get('country', ''),
            application_data.get('parent_name', ''), # New field
            application_data.get('relationship', ''), # New field
            application_data.get('preferred_course', ''),
            application_data.get('previous_experience', ''),
            application_data.get('learning_goals', '')
        ]
        
        print("Appending row to sheet...")
        worksheet.append_row(row)
        print(f"Successfully wrote application ID {application_data.get('id')} to Google Sheet.")
        return True

    except gspread.exceptions.SpreadsheetNotFound:
        print(f"ERROR: Spreadsheet not found. Please check that the SHEET_ID is correct and that you have shared the sheet with your service account email.")
        return False
    except gspread.exceptions.WorksheetNotFound:
        print(f"ERROR: Worksheet not found. Please check that the WORKSHEET_NAME ('{WORKSHEET_NAME}') is correct.")
        return False
    except gspread.exceptions.APIError as e:
        error_details = json.loads(e.response.text)
        print("A Google API error occurred:")
        print(json.dumps(error_details, indent=2))
        return False
    except Exception as e:
        print(f"An unexpected error occurred. Error type: {type(e)}. Error details: {e}")
        return False
