import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      // ✅ FIXED LOGIC
      if (res.ok) {
        toast.success(data.message || "Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }

    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-8">Sign in to track your food expiry</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
              <LogIn size={20} />
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/Forgot')} className="text-sm">
              Forgot Password?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}