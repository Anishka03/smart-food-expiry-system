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

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ VERY IMPORTANT
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }

    } catch (error) {
      console.error("Login error:", error);
      toast.error('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-8">Sign in to track your food expiry</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter your username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
            >
              <LogIn size={20} />
              Login
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <button
                onClick={() => navigate('/forgot')}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}