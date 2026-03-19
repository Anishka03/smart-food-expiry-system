import os
import random
from datetime import datetime, date
from datetime import timedelta
from functools import wraps
from threading import Thread

from flask import Flask, request, redirect, session, render_template, flash
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import or_

from models import db, User, Food
from email_utils import send_email
from whatsapp_utils import send_whatsapp
from reminder import check_expiry


# ================= LOAD ENV VARIABLES =================

load_dotenv()


# ================= APP CONFIG =================

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY", "fallback_secret")

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


# ================= LOGIN REQUIRED DECORATOR =================

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "uid" not in session:
            return redirect("/")
        return f(*args, **kwargs)
    return wrapper


# ================= ALERT FUNCTION =================

def send_food_alert(user, food_name, expiry_date):

    today = date.today()

    if expiry_date > today:
        msg = f"⏰ Food '{food_name}' expires on {expiry_date}"

    elif expiry_date == today:
        msg = f"⚠ Food '{food_name}' EXPIRES TODAY"

    else:
        msg = f"❌ Food '{food_name}' already expired"

    send_email(user.email, msg)
    send_whatsapp(user.phone, msg)


# ================= LOGIN =================

@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form["username"]
        password = request.form["password"]

        if not username or not password:
            flash("Please enter all fields")
            return redirect("/")

        user = User.query.filter(
            or_(User.username == username, User.email == username)
        ).first()

        if user and check_password_hash(user.password, password):
            session["uid"] = user.id
            return redirect("/dashboard")

        flash("Invalid username/email or password")

    return render_template("login.html")


# ================= REGISTER =================

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        username = request.form["username"]
        email = request.form["email"]
        phone = request.form["phone"]
        password = request.form["password"]

        # Check duplicates
        if User.query.filter_by(username=username).first():
            flash("Username already exists")
            return redirect("/register")

        if User.query.filter_by(email=email).first():
            flash("Email already registered")
            return redirect("/register")

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Store in session
        session["reg_otp"] = otp
        session["reg_data"] = {
            "username": username,
            "email": email,
            "phone": phone,
            "password": generate_password_hash(password)
        }

        msg = f"Your registration OTP is: {otp}"

        send_email(email, msg)
        send_whatsapp(phone, msg)

        flash("OTP sent to email and WhatsApp")
        return redirect("/verify_register_otp")

    return render_template("register.html")


# ================= VERIFY REGISTRATION OTP =================

@app.route("/verify_register_otp", methods=["GET", "POST"])
def verify_register_otp():

    if request.method == "POST":

        entered_otp = request.form["otp"]

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

            flash("Registration successful")
            return redirect("/")

        flash("Invalid OTP")

    return render_template("verify_register_otp.html")


# ================= FORGOT PASSWORD =================

@app.route("/forgot", methods=["GET", "POST"])
def forgot_password():

    if request.method == "POST":

        email = request.form["email"]
        user = User.query.filter_by(email=email).first()

        if user:

            otp = str(random.randint(100000, 999999))

            session["reset_otp"] = otp
            session["reset_user"] = user.id

            msg = f"Your OTP for password reset is: {otp}"

            send_email(user.email, msg)
            send_whatsapp(user.phone, msg)

            flash("OTP sent to your email and WhatsApp")
            return redirect("/verify_otp")

        flash("Email not found")

    return render_template("forgot.html")


# ================= VERIFY OTP =================

@app.route("/verify_otp", methods=["GET", "POST"])
def verify_otp():

    if request.method == "POST":

        entered_otp = request.form["otp"]

        if entered_otp == session.get("reset_otp"):
            return redirect("/reset_password")

        flash("Invalid OTP")

    return render_template("verify_otp.html")


# ================= RESET PASSWORD =================

@app.route("/reset_password", methods=["GET", "POST"])
def reset_password():

    if request.method == "POST":

        new_password = request.form["password"]

        user = db.session.get(User, session.get("reset_user"))

        if user:

            user.password = generate_password_hash(new_password)
            db.session.commit()

            session.pop("reset_otp", None)
            session.pop("reset_user", None)

            flash("Password Reset Successful")
            return redirect("/")

    return render_template("reset_password.html")


# ================= DASHBOARD =================

from datetime import timedelta

@app.route("/dashboard", methods=["GET", "POST"])
@login_required
def dashboard():

    user = User.query.get(session["uid"])

    if request.method == "POST":

        name = request.form["name"]

        expiry_date = datetime.strptime(
            request.form["expiry"], "%Y-%m-%d"
        ).date()

        new_food = Food(
            name=name,
            expiry=expiry_date,
            user_id=session["uid"]
        )

        db.session.add(new_food)
        db.session.commit()

        send_food_alert(user, name, expiry_date)

        flash("Food Added Successfully")

    # ===== DASHBOARD STATS =====
    foods = Food.query.filter_by(user_id=session["uid"]).all()

    today = date.today()
    soon = today + timedelta(days=2)

    total = len(foods)
    fresh = sum(1 for f in foods if f.expiry > soon)
    expiring = sum(1 for f in foods if today <= f.expiry <= soon)
    expired = sum(1 for f in foods if f.expiry < today)

    return render_template(
        "dashboard.html",
        total=total,
        fresh=fresh,
        expiring=expiring,
        expired=expired
    )

# ================= PROFILE =================

@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():

    user = User.query.get(session["uid"])

    if request.method == "POST":

        email = request.form["email"]
        phone = request.form["phone"]

        otp = str(random.randint(100000, 999999))

        session["profile_otp"] = otp
        session["profile_data"] = {
            "email": email,
            "phone": phone
        }

        msg = f"Your profile update OTP is: {otp}"

        send_email(email, msg)
        send_whatsapp(phone, msg)

        flash("OTP sent")
        return redirect("/verify_profile_otp")

    return render_template("profile.html", user=user)

# ================= VERIFY PROFILE OTP =================
@app.route("/verify_profile_otp", methods=["GET", "POST"])
@login_required
def verify_profile_otp():

    user = User.query.get(session["uid"])

    if request.method == "POST":

        entered_otp = request.form["otp"]

        if entered_otp == session.get("profile_otp"):

            data = session.get("profile_data")

            user.email = data["email"]
            user.phone = data["phone"]

            db.session.commit()

            session.pop("profile_otp", None)
            session.pop("profile_data", None)

            flash("Profile updated successfully")
            return redirect("/profile")

        flash("Invalid OTP")

    return render_template("verify_profile_otp.html")


# ================= FOOD LIST =================

@app.route("/foods")
@login_required
def food_list():

    search = request.args.get("search", "")
    filter_type = request.args.get("filter", "all")

    foods = Food.query.filter_by(user_id=session["uid"])

    # 🔍 Search
    if search:
        foods = foods.filter(Food.name.ilike(f"%{search}%"))

    foods = foods.all()

    today = date.today()
    soon = today + timedelta(days=2)

    # 🎯 Filter
    if filter_type == "fresh":
        foods = [f for f in foods if f.expiry > soon]

    elif filter_type == "expiring":
        foods = [f for f in foods if today <= f.expiry <= soon]

    elif filter_type == "expired":
        foods = [f for f in foods if f.expiry < today]

    return render_template(
        "food_list.html",
        foods=foods,
        today=today,
        search=search,
        filter_type=filter_type
    )


# ================= DELETE FOOD =================

@app.route("/delete/<int:id>")
@login_required
def delete_food(id):

    food = Food.query.filter_by(id=id, user_id=session["uid"]).first()

    if food:
        db.session.delete(food)
        db.session.commit()

    return redirect("/foods")


# ================= LOGOUT =================

@app.route("/logout")
@login_required
def logout():
    session.clear()
    return redirect("/")


# ================= RUN APP =================

if __name__ == "__main__":

    with app.app_context():
        db.create_all()

    Thread(target=check_expiry, args=(app,), daemon=True).start()

    app.run(debug=True)