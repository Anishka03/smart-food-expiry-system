from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # Relationship: one user can have many food items
    foods = db.relationship('Food', backref='user', lazy=True)


class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    expiry = db.Column(db.Date, nullable=False)

    last_alert_time = db.Column(db.DateTime, nullable=True)

    # Foreign key linking food to a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)