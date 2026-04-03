import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');

  // ================= VERIFY OTP =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified!");
        navigate("/reset-password");
      } else {
        toast.error(data.message || "Invalid OTP");
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
              <ShieldCheck className="text-white" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Enter OTP</h2>
          <p className="text-center text-gray-600 mb-8">
            Enter the OTP sent to your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
              placeholder="000000"
            />

            <button className="w-full bg-emerald-500 text-white py-3 rounded-lg flex justify-center gap-2">
              <ShieldCheck size={20} />
              Verify
            </button>

          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => toast.info("OTP already sent")}
              className="text-emerald-600 text-sm"
            >
              Resend OTP
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}