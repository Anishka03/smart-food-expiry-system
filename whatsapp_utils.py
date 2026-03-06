from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_TOKEN = os.getenv("TWILIO_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

client = Client(TWILIO_SID, TWILIO_TOKEN)


def send_whatsapp(to, msg):

    try:

        if not to.startswith("+91"):
            to = "+91" + to

        client.messages.create(
            body=msg,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{to}"
        )

        print("WhatsApp sent")

    except Exception as e:
        print("WhatsApp error:", e)