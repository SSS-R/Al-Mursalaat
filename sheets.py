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

# --- NEW: Use Sheet ID instead of Name ---
# TODO: Replace this with the actual ID of your Google Sheet
SHEET_ID = '1nAAAjHMOAYXK5lq1OoZBoDPh-jijMDEThs6F7pSqWyQ' 

WORKSHEET_NAME = 'Sheet1'


def append_to_sheet(application_data: dict):
    """
    Appends a new row with application data to the Google Sheet.
    """
    print("--- Attempting to write to Google Sheet using ID ---")
    try:
        # --- Authentication ---
        print("Authenticating with Google...")
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPE)
        client = gspread.authorize(creds)
        print("Authentication successful.")

        # --- Step 2: Open the spreadsheet by its unique ID ---
        print(f"Opening spreadsheet with ID: '{SHEET_ID}'...")
        spreadsheet = client.open_by_key(SHEET_ID) # <-- THIS IS THE NEW METHOD
        print("Spreadsheet opened successfully.")

        # --- Step 3: Select the worksheet ---
        print(f"Selecting worksheet: '{WORKSHEET_NAME}'...")
        worksheet = spreadsheet.worksheet(WORKSHEET_NAME)
        print("Worksheet selected successfully.")

        # --- Step 4: Prepare and append the row ---
        print("Preparing and appending row...")
        row = [
            application_data.get('id', ''),
            str(application_data.get('created_at', datetime.now())),
            application_data.get('first_name', ''),
            application_data.get('last_name', ''),
            application_data.get('email', ''),
            application_data.get('phone_number', ''),
            application_data.get('country', ''),
            application_data.get('preferred_course', ''),
            application_data.get('age', ''),
            application_data.get('previous_experience', ''),
            application_data.get('learning_goals', '')
        ]
        worksheet.append_row(row)
        print(f"Successfully wrote application ID {application_data.get('id')} to Google Sheet.")
        return True

    except gspread.exceptions.APIError as e:
        error_details = json.loads(e.response.text)
        print("A Google API error occurred:")
        print(json.dumps(error_details, indent=2))
        return False
    except Exception as e:
        print(f"An unexpected error occurred. Error type: {type(e)}. Error details: {e}")
        return False

