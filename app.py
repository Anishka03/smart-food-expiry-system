from flask_cors import CORS
import os
import random
from datetime import datetime, date, timedelta
from functools import wraps
from threading import Thread
import re

from flask import Flask, request, session, jsonify
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import or_

from models import db, User, Food, Notification
from email_utils import send_email
from whatsapp_utils import send_whatsapp

# ================= LOAD ENV =================
load_dotenv()

# ================= APP CONFIG =================
app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY", "fallback_secret")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ]
)

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

db.init_app(app)

# ================= ASYNC HELPER =================
def send_async(email, phone, msg):
    print("📤 Sending alert to:", email, phone)

    Thread(target=send_email, args=(email, msg)).start()
    Thread(target=send_whatsapp, args=(phone, msg)).start()

def send_food_alert(app, user, food_name, expiry_date):
    try:
        with app.app_context():

            today = date.today()

            if expiry_date > today:
                msg = f"⏰ Food '{food_name}' expires on {expiry_date}"
            elif expiry_date == today:
                msg = f"⚠ Food '{food_name}' EXPIRES TODAY"
            else:
                msg = f"❌ Food '{food_name}' already expired"

            new_notification = Notification(message=msg, user_id=user.id)
            db.session.add(new_notification)
            db.session.commit()

            send_async(user.email, user.phone, msg)

            print("✅ Alert sent successfully")

    except Exception as e:
        print("❌ Alert error:", e)

# ================= LOGIN REQUIRED =================
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "uid" not in session:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper

# ================= LOGIN =================
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    user = User.query.filter(
        or_(User.username == username, User.email == username)
    ).first()

    if user and check_password_hash(user.password, password):
        session["uid"] = user.id
        return jsonify({"status": "success", "message": "Login successful"})

    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

# ================= DASHBOARD =================
@app.route("/api/dashboard")
@login_required
def api_dashboard():
    foods = Food.query.filter_by(user_id=session["uid"]).all()

    today = date.today()
    soon = today + timedelta(days=2)

    total = len(foods)
    fresh = sum(1 for f in foods if f.expiry > soon)
    expiring = sum(1 for f in foods if today <= f.expiry <= soon)
    expired = sum(1 for f in foods if f.expiry < today)

    return jsonify({
        "total": total,
        "fresh": fresh,
        "expiring": expiring,
        "expired": expired
    })

# ================= FOOD LIST =================
@app.route("/api/foods")
@login_required
def api_foods():
    foods = Food.query.filter_by(user_id=session["uid"]).all()

    return jsonify([
        {"id": f.id, "name": f.name, "expiry": str(f.expiry)}
        for f in foods
    ])

# ================= ADD FOOD =================
@app.route("/api/add_food", methods=["POST"])
@login_required
def api_add_food():
    data = request.get_json()

    name = data.get("name")
    expiry = data.get("expiry")

    if not name or not expiry:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    try:
        expiry_date = datetime.strptime(expiry, "%Y-%m-%d").date()
    except:
        return jsonify({"status": "error", "message": "Invalid date format"}), 400

    new_food = Food(
        name=name,
        expiry=expiry_date,
        user_id=session["uid"]
    )

    db.session.add(new_food)
    db.session.commit()

    # ✅ FIX: SEND ALERT
    user = db.session.get(User, session["uid"])
    Thread(target=send_food_alert, args=(app, user, name, expiry_date)).start()

    return jsonify({"status": "success", "message": "Food added successfully"})

# ================= DELETE FOOD =================
@app.route("/api/delete_food/<int:id>", methods=["DELETE"])
@login_required
def api_delete_food(id):
    food = Food.query.filter_by(id=id, user_id=session["uid"]).first()

    if food:
        db.session.delete(food)
        db.session.commit()

    return jsonify({"status": "success", "message": "Food deleted successfully"})

# ================= LOGOUT =================
@app.route("/api/logout")
@login_required
def api_logout():
    session.clear()
    return jsonify({"status": "success", "message": "Logged out successfully"})

# ================= PROFILE =================
@app.route("/api/profile")
@login_required
def api_profile():
    user = db.session.get(User, session["uid"])

    return jsonify({
        "username": user.username,
        "email": user.email,
        "phone": user.phone
    })

# ================= REGISTER =================
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"status": "error", "message": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    otp = str(random.randint(100000, 999999))

    session["reg_otp"] = otp
    session["reg_data"] = {
        "username": username,
        "email": email,
        "phone": phone,
        "password": generate_password_hash(password)
    }

    msg = f"Your OTP is {otp}"
    send_async(email, phone, msg)

    return jsonify({"status": "success", "message": "OTP sent successfully"})

# ================= VERIFY REGISTER OTP =================
@app.route("/api/verify_register_otp", methods=["POST"])
def api_verify_register_otp():
    data = request.get_json()
    entered_otp = data.get("otp")

    if entered_otp == session.get("reg_otp"):
        data = session.get("reg_data")

        new_user = User(
            username=data["username"],
            email=data["email"],
            phone=data["phone"],
            password=data["password"]
        )

        db.session.add(new_user)
        db.session.commit()

        session.pop("reg_otp", None)
        session.pop("reg_data", None)

        return jsonify({"status": "success", "message": "Registered successfully"})

    return jsonify({"status": "error", "message": "Invalid OTP"}), 400

# ================= FORGOT PASSWORD =================
@app.route("/api/forgot", methods=["POST"])
def api_forgot():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"status": "error", "message": "Email not found"}), 404

    otp = str(random.randint(100000, 999999))

    session["reset_otp"] = otp
    session["reset_uid"] = user.id

    msg = f"Your password reset OTP is {otp}"
    send_async(user.email, user.phone, msg)

    return jsonify({"status": "success", "message": "OTP sent"})

# ================= VERIFY OTP =================
@app.route("/api/verify_otp", methods=["POST"])
def api_verify_otp():
    data = request.get_json()
    otp = data.get("otp")

    if otp == session.get("reset_otp"):
        return jsonify({"status": "success", "message": "OTP verified"})

    return jsonify({"status": "error", "message": "Invalid OTP"}), 400

# ================= RESET PASSWORD =================
@app.route("/api/reset_password", methods=["POST"])
def api_reset_password():
    data = request.get_json()

    password = data.get("password")

    # 🔒 PASSWORD VALIDATION
    if not password:
        return jsonify({"status": "error", "message": "Password is required"}), 400

    if len(password) < 8:
        return jsonify({"status": "error", "message": "Password must be at least 8 characters"}), 400

    if not re.search(r"[A-Z]", password):
        return jsonify({"status": "error", "message": "Must contain uppercase letter"}), 400

    if not re.search(r"[a-z]", password):
        return jsonify({"status": "error", "message": "Must contain lowercase letter"}), 400

    if not re.search(r"[0-9]", password):
        return jsonify({"status": "error", "message": "Must contain a number"}), 400

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return jsonify({"status": "error", "message": "Must contain special character"}), 400

    uid = session.get("reset_uid")

    if not uid:
        return jsonify({"status": "error", "message": "Session expired"}), 400

    user = db.session.get(User, uid)
    user.password = generate_password_hash(password)
    db.session.commit()

    session.pop("reset_otp", None)
    session.pop("reset_uid", None)

    return jsonify({"status": "success", "message": "Password updated"})

# ================= DELETE ACCOUNT =================
@app.route("/api/delete_account", methods=["DELETE"])
@login_required
def api_delete_account():
    user = db.session.get(User, session["uid"])

    if user:
        db.session.delete(user)
        db.session.commit()

    session.clear()

    return jsonify({"status": "success", "message": "Account deleted"})

# ================= PROFILE UPDATE REQUEST =================
@app.route("/api/request_profile_update", methods=["POST"])
@login_required
def api_request_profile_update():
    data = request.get_json()

    email = data.get("email")
    phone = data.get("phone")

    otp = str(random.randint(100000, 999999))

    session["profile_otp"] = otp
    session["profile_data"] = {
        "email": email,
        "phone": phone
    }

    user = db.session.get(User, session["uid"])

    msg = f"Your profile update OTP is {otp}"
    send_async(user.email, user.phone, msg)

    return jsonify({"status": "success", "message": "OTP sent"})

# ================= VERIFY PROFILE OTP =================
@app.route("/api/verify_profile_otp", methods=["POST"])
@login_required
def api_verify_profile_otp():
    data = request.get_json()
    otp = data.get("otp")

    if otp == session.get("profile_otp"):
        user = db.session.get(User, session["uid"])
        new_data = session.get("profile_data")

        user.email = new_data["email"]
        user.phone = new_data["phone"]

        db.session.commit()

        session.pop("profile_otp", None)
        session.pop("profile_data", None)

        return jsonify({"status": "success", "message": "Profile updated"})

    return jsonify({"status": "error", "message": "Invalid OTP"}), 400


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # creates tables if not exist

    app.run(debug=True)

