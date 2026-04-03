from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # Relationships
    foods = db.relationship(
        'Food',
        backref='user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    notifications = db.relationship(
        'Notification',
        backref='user',
        lazy=True,
        cascade="all, delete-orphan"
    )

class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    expiry = db.Column(db.Date, nullable=False)

    last_alert_time = db.Column(db.DateTime, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    message = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)