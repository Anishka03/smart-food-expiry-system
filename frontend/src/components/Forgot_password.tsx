import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  // ================= SEND OTP =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Enter your email");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent!");
        navigate("/verify-otp");
      } else {
        toast.error(data.message || "Email not found");
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
              <Mail className="text-white" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Forgot Password</h2>
          <p className="text-center text-gray-600 mb-8">
            Enter your email to receive OTP
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full px-4 py-3 border rounded-lg"
            />

            <button className="w-full bg-emerald-500 text-white py-3 rounded-lg flex justify-center gap-2">
              <Mail size={20} />
              Send OTP
            </button>

          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-sm">
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}