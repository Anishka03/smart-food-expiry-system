from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    password = db.Column(db.String(50))


class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    expiry = db.Column(db.Date)
    last_alert_time = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer)