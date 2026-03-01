from datetime import datetime, date
from models import db, Food, User
from email_utils import send_email
from whatsapp_utils import send_whatsapp
import time

def check_expiry(app):
    while True:
        with app.app_context():
            now = datetime.now()
            today = date.today()

            foods = Food.query.all()

            for food in foods:
                user = db.session.get(User, food.user_id)
                if not user:
                    continue

                if food.last_alert_time:
                    hours = (now - food.last_alert_time).total_seconds() / 3600
                    if hours < 6:
                        continue

                if food.expiry > today:
                    msg = f"⏰ Food '{food.name}' expires on {food.expiry}"
                elif food.expiry == today:
                    msg = f"⚠ Food '{food.name}' EXPIRES TODAY"
                else:
                    msg = f"❌ Food '{food.name}' EXPIRED"

                send_email(user.email, msg)
                send_whatsapp(user.phone, msg)

                food.last_alert_time = now
                db.session.commit()

        time.sleep(300)