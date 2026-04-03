# 🍽️ Smart Food Expiry System

A full-stack web application that helps users **track food expiry**, **reduce waste**, and receive **real-time alerts** via Email and WhatsApp.

---

## 🚀 Features

### 🔐 Authentication

- User Registration with OTP verification
- Secure Login (session-based)
- Forgot Password with OTP verification
- Strong Password Validation:
  - Minimum 8 characters
  - Uppercase & lowercase letters
  - Numbers & special characters

---

### 📊 Dashboard

- View food statistics:
  - Total items
  - Fresh items
  - Expiring soon
  - Expired items

---

### 🥗 Food Management

- Add food items with expiry dates
- View all food items
- Delete items
- Automatic status detection:
  - Fresh
  - Expiring
  - Expired

---

### 🔔 Notifications

- 📧 Email alerts (SMTP)
- 📱 WhatsApp alerts (Twilio API)
- Instant alert when food is added
- Notification records stored in database

---

### 👤 Profile Management

- View profile details
- Update email & phone
- OTP-based profile update verification

---

### ⚠️ Account Management

- Secure account deletion
- Cascade delete (removes all user data safely)

---

## 🛠️ Tech Stack

### Frontend

- React (TypeScript)
- Tailwind CSS
- React Router
- Sonner (Toast Notifications)
- Lucide Icons

---

### Backend

- Flask
- Flask-SQLAlchemy
- Flask-CORS
- SQLite Database
- Twilio API (WhatsApp)
- SMTP (Email)

---

## 📁 Project Structure
smart-food-expiry-system/
│
├── app.py # Flask backend
├── models.py # Database models
├── email_utils.py # Email notifications
├── whatsapp_utils.py # WhatsApp notifications
├── requirements.txt # Backend dependencies
├── instance/
│ └── food.db # SQLite database
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Login.tsx
│ │ │ ├── Dashboard.tsx
│ │ │ ├── FoodList.tsx
│ │ │ ├── Profile.tsx
│ │ │ ├── Register.tsx
│ │ │ ├── Forgot_password.tsx
│ │ │ ├── Verify_otp.tsx
│ │ │ ├── Reset_password.tsx
│ │ │ ├── Delete_account.tsx
│ │ │ └── Verify_profile_otp.tsx
│ │ ├── App.tsx
│ │ └── main.tsx
│ │
│ ├── package.json
│ └── tailwind.config.js
│
└── README.md


---

## ⚙️ Installation & Setup

### 🔹 1. Clone Repository

```bash
git clone https://github.com/Anishka03/smart-food-expiry-system.git
cd smart-food-expiry-system

python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt

2. Backend Setup
  SECRET_KEY=your_secret_key
  DATABASE_URL=sqlite:///instance/food.db
  SENDER_EMAIL=your_email
  SENDER_PASSWORD=your_app_password
  TWILIO_SID=your_sid
  TWILIO_TOKEN=your_token
  TWILIO_WHATSAPP_NUMBER=your_twilio_number

  Run backend:
    python app.py

3. Frontend Setup:
    cd frontend
    npm install
    npm run dev   # for Vite

🌐 API Endpoints
🔐 Auth
Method	  Endpoint	                  Description
POST	    /api/login	                Login user
POST	    /api/register	              Register user
POST	    /api/verify_register_otp	  Verify registration OTP
POST	    /api/forgot	                Send reset OTP
POST	    /api/verify_otp	            Verify reset OTP
POST	    /api/reset_password	        Reset password

🍱 Food
Method	  Endpoint	                  Description
GET	      /api/dashboard	            Get stats
GET	      /api/foods	                Get food list
POST	    /api/add_food	              Add food
DELETE	  /api/delete_food/<id>	      Delete food


👤 User
Method	  Endpoint	                    Description
GET	      /api/profile	                Get profile
POST	    /api/request_profile_update	  Send OTP
POST	    /api/verify_profile_otp	      Verify OTP
DELETE	  /api/delete_account	          Delete account
GET	      /api/logout	                  Logout


🔐 Authentication Flow
User logs in
Flask creates session
Frontend sends credentials: "include"
Backend verifies session
Protected routes accessible

🔒 Security Features
Password hashing using Werkzeug
Strong password validation
OTP-based verification
Session-based authentication
Cascade delete for data integrity

📸 Screens (UI Preview)
Login Page
Dashboard
Food List
Profile Page
OTP Screens