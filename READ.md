# 🍽️ Smart Food Expiry System

A full-stack web application that helps users **track food expiry**, **reduce waste**, and receive **timely alerts** via email and WhatsApp.

---

## 🚀 Features

### 🔐 Authentication

* User Login & Registration
* OTP Verification (Email & Phone - Demo)
* Session-based authentication

### 📊 Dashboard

* View food statistics:

  * Total items
  * Fresh items
  * Expiring soon
  * Expired items

### 🥗 Food Management

* Add food items with expiry dates
* View all food items
* Delete items
* Automatic status detection (Fresh / Expiring / Expired)

### 🔔 Notifications

* Email alerts 📧
* WhatsApp alerts 📱 (via Twilio)
* Background expiry checker

### 👤 Profile

* View & update user details
* OTP-based profile update (UI demo)

### ⚠️ Account Management

* Delete account functionality
* Secure confirmation flow

---

## 🛠️ Tech Stack

### Frontend

* React (TypeScript)
* Tailwind CSS
* React Router
* Sonner (Toast notifications)
* Lucide Icons

### Backend

* Flask
* Flask-SQLAlchemy
* Flask-CORS
* SQLite Database
* Twilio API (WhatsApp)
* SMTP (Email)

---

## 📁 Project Structure

```
smart-food-expiry-system/
│
├── app.py                # Flask backend
├── models.py            # Database models
├── reminder.py          # Background expiry checker
├── email_utils.py       # Email notifications
├── whatsapp_utils.py    # WhatsApp notifications
├── requirements.txt     # Backend dependencies
├── instance/
│   └── food.db          # SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FoodList.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Forgot_password.tsx
│   │   │   ├── Verify_otp.tsx
│   │   │   ├── Reset_password.tsx
│   │   │   ├── Delete_account.tsx
│   │   │   └── Verify_profile_otp.tsx
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/Anishka03/smart-food-expiry-system.git
cd smart-food-expiry-system
```

---

### 🔹 2. Backend Setup

```bash
cd backend  # or root if backend is in root
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Create `.env` file:

```env
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///instance/food.db
EMAIL_USER=your_email
EMAIL_PASS=your_password
TWILIO_SID=your_sid
TWILIO_AUTH=your_auth
```

Run backend:

```bash
python app.py
```

---

### 🔹 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌐 API Endpoints

| Method | Endpoint                | Description   |
| ------ | ----------------------- | ------------- |
| POST   | `/api/login`            | Login user    |
| GET    | `/api/dashboard`        | Get stats     |
| GET    | `/api/foods`            | Get food list |
| POST   | `/api/add_food`         | Add food      |
| DELETE | `/api/delete_food/<id>` | Delete food   |
| GET    | `/api/logout`           | Logout        |

---

## 🔐 Authentication Flow

1. User logs in
2. Flask creates session
3. Frontend sends `credentials: "include"`
4. Backend verifies session
5. Protected routes accessible

---

## ⚠️ Notes

* OTP pages are **UI-only (demo)** currently
* SQLite is used (can be upgraded to MySQL/PostgreSQL)
* Notifications run in background thread

---

## 📸 Screens (UI Preview)

* Login Page
* Dashboard
* Food List
* Profile Page
* OTP Screens

---

## 🚀 Future Improvements

* JWT Authentication
* Real OTP Integration
* Push Notifications
* AI-based expiry prediction
* Mobile App version

---

## 👨‍💻 Author

**Anishka Naragoni**

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 🛠️ Contribute

---

## 📄 License

This project is open-source and available under the MIT License.
