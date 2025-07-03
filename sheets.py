# sheets.py

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

# --- Configuration ---
# Define the scope of the APIs we need to access.
SCOPE = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
]

# Path to your credentials JSON file.
CREDS_FILE = 'credentials.json'

# Name of the Google Sheet you created.
SHEET_NAME = 'Al-Mursalaat Data'

# Name of the specific worksheet (the tab at the bottom).
WORKSHEET_NAME = 'Sheet1'


def append_to_sheet(application_data: dict):
    """
    Appends a new row with application data to the Google Sheet.

    Args:
        application_data: A dictionary containing the application details.
    """
    try:
        # --- Authentication ---
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPE)
        client = gspread.authorize(creds)

        # --- Open the worksheet ---
        spreadsheet = client.open(SHEET_NAME)
        worksheet = spreadsheet.worksheet(WORKSHEET_NAME)

        # --- Prepare the row data ---
        # The order of items in this list MUST match the order of your columns in the sheet.
        row = [
            application_data.get('id', ''),
            application_data.get('created_at', str(datetime.now())),
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

        # --- Append the row ---
        worksheet.append_row(row)
        print(f"Successfully wrote application ID {application_data.get('id')} to Google Sheet.")
        return True

    except Exception as e:
        # If anything goes wrong, print the error to the console.
        print(f"Error writing to Google Sheet: {e}")
        return False

