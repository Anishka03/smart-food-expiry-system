import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Mail, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);

  // ================= FETCH PROFILE =================
  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    })
      .then(res => {
        if (res.status === 401) {
          navigate("/");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setFormData({
            username: data.username,
            email: data.email,
            phone: data.phone,
          });
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  // ================= UPDATE PROFILE =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/update_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Update failed");
      }

    } catch {
      toast.error("Server error");
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/logout", {
      credentials: "include",
    });

    toast.success("Logged out successfully!");
    navigate("/");
  };

  // ================= LOADING =================
  if (loading) return <h2 className="p-6">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={20} />
            Logout
          </button>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8 border mb-6">

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={48} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User size={18} /> Username
              </label>
              <input
                name="username"
                value={formData.username}
                readOnly
                className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Mail size={18} /> Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Phone size={18} /> Phone
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700"
            >
              Update Profile
            </button>

          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-200">
          <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={24} />
            Danger Zone
          </h3>

          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back.
          </p>

          <button
            onClick={() => navigate('/delete-account')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={20} />
            Delete Account
          </button>
        </div>

      </main>
    </div>
  );
}