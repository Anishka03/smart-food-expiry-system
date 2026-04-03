import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  // ================= RESET PASSWORD =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Enter new password");
      return;
    }

  // 🔒 Strong password validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Must include uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Must include lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Must include a number");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Must include special character");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully!");
        navigate("/");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <Lock className="text-white" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Reset Password</h2>
          <p className="text-center text-gray-600 mb-8">
            Enter your new password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <button className="w-full bg-emerald-500 text-white py-3 rounded-lg flex justify-center gap-2">
              <Lock size={20} />
              Update Password
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}