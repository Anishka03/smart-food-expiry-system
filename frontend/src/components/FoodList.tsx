import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Search, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FoodItem {
  id: number;
  name: string;
  expiry: string;
  status: 'fresh' | 'expiring' | 'expired';
  daysLeft: number;
}

export function FoodList() {
  const navigate = useNavigate();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fresh' | 'expiring' | 'expired'>('all');

  // ================= FETCH FOODS =================
  useEffect(() => {
  fetch("http://localhost:5000/api/foods", {
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
      if (!data || !Array.isArray(data)) {
        console.error("Invalid data:", data); // 👈 DEBUG
        return;
      }

      const today = new Date();

      const processed = data.map((f: any) => {
        const expiryDate = new Date(f.expiry);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'fresh' | 'expiring' | 'expired';

        if (daysLeft < 0) status = 'expired';
        else if (daysLeft <= 2) status = 'expiring';
        else status = 'fresh';

        return {
          id: f.id,
          name: f.name,
          expiry: f.expiry,
          status,
          daysLeft,
        };
      });

      setFoods(processed);
    })
    .catch(err => {
      console.error(err);
      toast.error("Error loading foods");
    });
}, []);

  // ================= DELETE =================
  const handleDelete = async (id: number, name: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/delete_food/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success(`${name} deleted successfully!`);

        // remove from UI
        setFoods(prev => prev.filter(f => f.id !== id));
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  // ================= FILTER =================
  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || food.status === filterType;
    return matchesSearch && matchesFilter;
  });

  // ================= UI HELPERS =================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expiring':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh':
        return '✅';
      case 'expiring':
        return '⚠️';
      case 'expired':
        return '❌';
      default:
        return '📦';
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Food List</h1>
          </div>

          <button
            onClick={() => {
              fetch("http://localhost:5000/api/logout", { credentials: "include" });
              navigate("/");
            }}
            className="text-red-600"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="p-6 grid md:grid-cols-2 gap-4">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="border p-3 rounded"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="border p-3 rounded"
        >
          <option value="all">All</option>
          <option value="fresh">Fresh</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Food Cards */}
      <div className="p-6 space-y-4">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <div key={food.id} className="bg-white p-4 rounded shadow flex justify-between">

              <div>
                <h3 className="font-bold">{food.name}</h3>
                <p>Expiry: {food.expiry}</p>

                <span className={`px-2 py-1 rounded ${getStatusColor(food.status)}`}>
                  {food.status === 'fresh' && `${food.daysLeft} days left`}
                  {food.status === 'expiring' && `⚠ ${food.daysLeft} days left`}
                  {food.status === 'expired' && `Expired`}
                </span>
              </div>

              <button onClick={() => handleDelete(food.id, food.name)}>
                <Trash2 />
              </button>

            </div>
          ))
        ) : (
          <p>No items found</p>
        )}
      </div>
    </div>
  );
}