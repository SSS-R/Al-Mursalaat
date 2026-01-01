# email.py

import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# --- Configuration ---
# Get the API Key from the environment variable for Brevo
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
# This is the verified email address you created in Brevo
FROM_EMAIL = 'almursalaatonline@gmail.com' 
# This is the name associated with your sender email
FROM_NAME = 'Al-Mursalaat'
# The email address where you want to receive admin notifications
ADMIN_EMAIL = 'almursalaatonline@gmail.com'

# --- Brevo API Client Setup ---
# This setup is done once and reused by the functions below
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = BREVO_API_KEY
api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


def send_student_confirmation(application_data: dict):
    """Sends a confirmation email to the student using Brevo."""
    if not BREVO_API_KEY:
        print("ERROR: BREVO_API_KEY not found. Cannot send email.")
        return

    student_email = application_data.get('email')
    student_name = application_data.get('first_name', 'student')
    
    subject = 'Your Application to Al-Mursalaat has been received!'
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

    # Create the email object for Brevo
    sender = {"name": FROM_NAME, "email": FROM_EMAIL}
    to = [{"email": student_email, "name": student_name}]
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(to=to, sender=sender, subject=subject, html_content=html_content)

    try:
        # Send the email
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Student confirmation email sent to {student_email}. Response: {api_response}")
    except ApiException as e:
        print(f"Error sending student confirmation email: {e}")


def send_admin_notification(application_data: dict):
    """Sends a notification email to the admin with the new application details using Brevo."""
    if not BREVO_API_KEY:
        print("ERROR: BREVO_API_KEY not found. Cannot send email.")
        return

    # Create a formatted string or HTML table of the application data
    details = ""
    for key, value in application_data.items():
        if not key.startswith('_'):
            details += f"<strong>{key.replace('_', ' ').title()}:</strong> {value}<br>"

    subject = f"New Application from {application_data.get('first_name')} {application_data.get('last_name')}"
    html_content = f"""
    <h3>New Student Application Received</h3>
    <p>A new application has been submitted through the website.</p>
    <hr>
    {details}
    """

    sender = {"name": FROM_NAME, "email": FROM_EMAIL}
    to = [{"email": ADMIN_EMAIL, "name": "Al-Mursalaat Admin"}]
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(to=to, sender=sender, subject=subject, html_content=html_content)

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Admin notification sent to {ADMIN_EMAIL}. Response: {api_response}")
    except ApiException as e:
        print(f"Error sending admin notification email: {e}")


def send_admin_credentials_email(admin_data: dict, temp_password: str):
    """Sends a welcome email to a new admin with their temporary password using Brevo."""
    if not BREVO_API_KEY:
        print("ERROR: BREVO_API_KEY not found. Cannot send email.")
        return

    admin_email = admin_data.get('email')
    admin_name = admin_data.get('name', 'Admin')

    subject = 'Your New Admin Account for Al-Mursalaat'
    html_content = f"""
    <h3>Welcome to the Al-Mursalaat Admin Team, {admin_name}!</h3>
    <p>An account has been created for you. You can log in to the admin panel using the following credentials:</p>
    <ul>
        <li><strong>Username:</strong> {admin_email}</li>
        <li><strong>Temporary Password:</strong> {temp_password}</li>
    </ul>
    <p>It is strongly recommended that you change your password after your first login.</p>
    <br>
    <p>Sincerely,</p>
    <p>The Al-Mursalaat Team</p>
    """

    sender = {"name": FROM_NAME, "email": FROM_EMAIL}
    to = [{"email": admin_email, "name": admin_name}]
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(to=to, sender=sender, subject=subject, html_content=html_content)

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Admin credentials email sent to {admin_email}. Response: {api_response}")
    except ApiException as e:
        print(f"Error sending admin credentials email: {e}")


def send_teacher_credentials_email(teacher_data: dict, temp_password: str):
    """Sends a welcome email to a new teacher with their temporary password using Brevo."""
    if not BREVO_API_KEY:
        print("ERROR: BREVO_API_KEY not found. Cannot send email.")
        return

    teacher_email = teacher_data.get('email')
    teacher_name = teacher_data.get('name', 'Teacher')

    subject = 'Your New Teacher Account for Al-Mursalaat'
    html_content = f"""
    <h3>Assalamu Alaikum, {teacher_name}!</h3>
    <p>Welcome to the Al-Mursalaat teaching team. An account has been created for your portal.</p>
    <p>Your login credentials are:</p>
    <ul>
        <li><strong>Username:</strong> {teacher_email}</li>
        <li><strong>Temporary Password:</strong> {temp_password}</li>
    </ul>
    <p>Please keep these safe. You will be able to access your teacher dashboard soon.</p>
    <br>
    <p>Sincerely,</p>
    <p>The Al-Mursalaat Team</p>
    """
    
    sender = {"name": FROM_NAME, "email": FROM_EMAIL}
    to = [{"email": teacher_email, "name": teacher_name}]
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(to=to, sender=sender, subject=subject, html_content=html_content)

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Teacher credentials email sent to {teacher_email}. Response: {api_response}")
    except ApiException as e:
        print(f"Error sending teacher credentials email: {e}")

def send_forgot_password_email(email: str, temp_password: str):
    """Sends a temporary password to a user who forgot theirs."""
    if not BREVO_API_KEY:
        print("ERROR: BREVO_API_KEY not found.")
        return

    subject = 'Password Reset - Al-Mursalaat'
    html_content = f"""
    <h3>Password Reset Request</h3>
    <p>We received a request to reset your password for Al-Mursalaat.</p>
    <p>Your new <strong>Temporary Password</strong> is: <span style="font-size: 18px; color: #2d89ef;">{temp_password}</span></p>
    <p>Please log in and change this password immediately in your profile settings.</p>
    <br>
    <p>If you did not request this, please contact support.</p>
    """

    sender = {"name": FROM_NAME, "email": FROM_EMAIL}
    to = [{"email": email}]
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(to=to, sender=sender, subject=subject, html_content=html_content)

    try:
        api_instance.send_transac_email(send_smtp_email)
        print(f"Forgot password email sent to {email}")
    except ApiException as e:
        print(f"Error sending forgot password email: {e}")