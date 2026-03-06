import os
import random
from functools import wraps
from datetime import datetime, date
from threading import Thread

from flask import Flask, request, redirect, session, render_template, flash
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User, Food
from email_utils import send_email
from whatsapp_utils import send_whatsapp
from reminder import check_expiry


# ================= LOAD ENV VARIABLES =================

load_dotenv()


# ================= APP CONFIG =================

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY")

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

        user = User.query.filter_by(
            username=request.form["username"]
        ).first()

        if user and check_password_hash(user.password, request.form["password"]):
            session["uid"] = user.id
            return redirect("/dashboard")

        flash("Invalid Login")

    return render_template("login.html")


# ================= REGISTER =================

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        username = request.form["username"]
        email = request.form["email"]
        phone = request.form["phone"]
        password = request.form["password"]

        existing_user = User.query.filter_by(username=username).first()

        if existing_user:
            flash("Username already exists")
            return redirect("/register")

        existing_email = User.query.filter_by(email=email).first()

        if existing_email:
            flash("Email already registered")
            return redirect("/register")

        hashed_password = generate_password_hash(password)

        new_user = User(
            username=username,
            email=email,
            phone=phone,
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        flash("Registration successful. Please login.")

        return redirect("/")

    return render_template("register.html")


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

    return render_template("dashboard.html")


# ================= FOOD LIST =================

@app.route("/foods")
@login_required
def food_list():

    foods = Food.query.filter_by(user_id=session["uid"]).all()

    return render_template("food_list.html", foods=foods)


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