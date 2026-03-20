import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, List, LogOut, PlusCircle,
  TrendingUp, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();

  const [foodName, setFoodName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // ✅ REAL stats (from backend)
  const [stats, setStats] = useState({
    total: 0,
    fresh: 0,
    expiring: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);

  // ================= FETCH DASHBOARD =================
  useEffect(() => {
  fetch("http://localhost:5000/api/dashboard", {
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
      if (data) setStats(data);
    })
    .catch(() => toast.error("Error"))
    .finally(() => setLoading(false));
}, []);

  // ================= ADD FOOD =================
  const handleAddFood = async (e: any) => {
  e.preventDefault();

  if (!foodName || !expiryDate) {
    toast.error("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/add_food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: foodName,
        expiry: expiryDate,
      }),
    });

    const data = await res.json();

    console.log("Response:", data); // 👈 DEBUG

    if (res.ok) {
      toast.success("Food added!");

      setFoodName("");
      setExpiryDate("");

      // refresh stats
      fetch("http://localhost:5000/api/dashboard", {
        credentials: "include",
      })
        .then(res => res.json())
        .then(setStats);

    } else {
      toast.error(data.message || "Error adding food");
    }

  } catch (err) {
    console.error(err); // 👈 DEBUG
    toast.error("Server error");
  }
};

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/logout", {
      credentials: "include",
    });

    toast.success("Logged out");
    navigate("/");
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Food Tracker</h1>

          <div className="flex gap-3">
            <button onClick={() => navigate('/profile')}>
              <User />
            </button>
            <button onClick={() => navigate('/foods')}>
              <List />
            </button>
            <button onClick={handleLogout}>
              <LogOut />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <TrendingUp /> {stats.total}
        </div>

        <div className="bg-green-100 p-4 rounded">
          <CheckCircle /> {stats.fresh}
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <AlertTriangle /> {stats.expiring}
        </div>

        <div className="bg-red-100 p-4 rounded">
          <XCircle /> {stats.expired}
        </div>
      </div>

      {/* Add Food */}
      <div className="p-6">
        <form onSubmit={handleAddFood} className="space-y-4">
          <input
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="Food name"
            className="border p-2"
          />

          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="border p-2"
          />

          <button className="bg-green-500 text-white px-4 py-2">
            Add Food
          </button>
        </form>
      </div>
    </div>
  );
}