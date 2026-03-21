import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  // ================= REGISTER =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent!");
        navigate('/verify-register-otp');
      } else {
        toast.error(data.message || "Registration failed");
      }

    } catch {
      toast.error("Server error");
    }
  };

  // ================= INPUT =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-center text-gray-600 mb-8">Join us to track your food expiry</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <button className="w-full bg-emerald-500 text-white py-3 rounded-lg flex justify-center gap-2">
              <UserPlus size={20} />
              Register
            </button>

          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <button onClick={() => navigate('/')} className="text-emerald-600">
              Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}