import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteAccount() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (confirmText !== "DELETE") {
    toast.error("Please type DELETE to confirm");
    return;
  }

  const confirmed = window.confirm(
    "⚠ Are you sure you want to delete your account?\nThis action cannot be undone!"
  );

  if (!confirmed) return;

  try {
    const res = await fetch("http://localhost:5000/api/delete_account", {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Account deleted successfully");

      navigate("/"); // back to login
    } else {
      toast.error(data.message || "Delete failed");
    }

  } catch {
    toast.error("Server error");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Delete Account</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 border-2 border-red-200">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Are you absolutely sure?
          </h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <p className="text-red-800 font-medium mb-3 flex items-start gap-2">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
              <span>This action is irreversible. All your data will be permanently deleted.</span>
            </p>
            <ul className="text-red-700 text-sm space-y-2 ml-7">
              <li>• All your food items will be deleted</li>
              <li>• Your account information will be removed</li>
              <li>• You will lose access to all features</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                id="confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Type DELETE here"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
            >
              <Trash2 size={20} />
              Delete My Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancel and go back to profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
