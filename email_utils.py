import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")


def send_email(to, msg):
    try:
        message = MIMEText(msg)
        message["Subject"] = "Food Expiry Alert"
        message["From"] = SENDER_EMAIL
        message["To"] = to

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        server.sendmail(
            SENDER_EMAIL,
            to,
            message.as_string()
        )

        server.quit()

        print("Email sent")

    except Exception as e:
        print("Email error:", e)