# email.py

import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Load environment variables from the .env file
load_dotenv()

# --- Configuration ---
# Get the API Key from the environment variable
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
# This is the verified email address you created in SendGrid
FROM_EMAIL = 'almursalaatonline@gmail.com' 
# The email address where you want to receive admin notifications
ADMIN_EMAIL = 'almursalaatonline@gmail.com'


def send_student_confirmation(application_data: dict):
    """Sends a confirmation email to the student."""
    if not SENDGRID_API_KEY:
        print("ERROR: SENDGRID_API_KEY not found. Cannot send email.")
        return

    student_email = application_data.get('email')
    student_name = application_data.get('first_name', 'student')

    # You can create beautiful emails using HTML
    html_content = f"""
    <h3>Assalamu Alaikum, {student_name}!</h3>
    <p>Thank you for your application to Al-Mursalaat.</p>
    <p>We have successfully received your details and will be in touch with you shortly regarding the next steps.</p>
    <p><strong>Course Applied For:</strong> {application_data.get('preferred_course')}</p>
    <p>If you have any questions, please feel free to reply to this email.</p>
    <br>
    <p>Sincerely,</p>
    <p>The Al-Mursalaat Team</p>
    """

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=student_email,
        subject='Your Application to Al-Mursalaat has been received!',
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Student confirmation email sent to {student_email}. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending student confirmation email: {e}")


def send_admin_notification(application_data: dict):
    """Sends a notification email to the admin with the new application details."""
    if not SENDGRID_API_KEY:
        print("ERROR: SENDGRID_API_KEY not found. Cannot send email.")
        return

    # Create a formatted string or HTML table of the application data
    details = ""
    for key, value in application_data.items():
        # Exclude internal SQLAlchemy state from the email
        if not key.startswith('_'):
            details += f"<strong>{key.replace('_', ' ').title()}:</strong> {value}<br>"

    html_content = f"""
    <h3>New Student Application Received</h3>
    <p>A new application has been submitted through the website.</p>
    <hr>
    {details}
    """

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=ADMIN_EMAIL,
        subject=f"New Application from {application_data.get('first_name')} {application_data.get('last_name')}",
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Admin notification sent to {ADMIN_EMAIL}. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending admin notification email: {e}")



def send_admin_credentials_email(admin_data: dict, temp_password: str):
    """Sends a welcome email to a new admin with their temporary password."""
    if not SENDGRID_API_KEY:
        print("ERROR: SENDGRID_API_KEY not found. Cannot send email.")
        return

    admin_email = admin_data.get('email')
    admin_name = admin_data.get('name', 'Admin')

    html_content = f"""
    <h3>Welcome to the Al-Mursalaat Admin Team, {admin_name}!</h3>
    <p>An account has been created for you. You can log in to the admin panel using the following credentials:</p>
    <ul>
        <li><strong>Username:</strong> {admin_email}</li>
        <li><strong>Temporary Password:</strong> {temp_password}</li>
    </ul>
    <p>It is strongly recommended that you change your password after your first login (we will build this feature later).</p>
    <br>
    <p>Sincerely,</p>
    <p>The Al-Mursalaat Team</p>
    """

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=admin_email,
        subject='Your New Admin Account for Al-Mursalaat',
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Admin credentials email sent to {admin_email}. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending admin credentials email: {e}")