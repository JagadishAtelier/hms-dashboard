import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import foodService from "../../service/foodService";

export default function FoodManagerList() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await foodService.getAllManagers({ limit: 100 });
      setManagers(res.data?.data?.data || res.data?.data || []);
    } catch { toast.error("Failed to load food managers"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={20} className="text-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Food Managers</h2>
            <p className="text-xs text-gray-500">Manage food management staff</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="p-2 rounded-md border border-gray-200 bg-white text-gray-500"><RefreshCw size={14} /></button>
          <button onClick={() => navigate("/food-managers/create")}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#506EE4] text-white hover:bg-[#3f56c2]">
            <Plus size={14} /> Add Food Manager
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Phone", "Shift", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td></tr>
            ) : managers.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No food managers found.</td></tr>
            ) : managers.map(m => (
              <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{m.manager_name}</td>
                <td className="px-4 py-3 text-gray-600">{m.manager_email}</td>
                <td className="px-4 py-3 text-gray-600">{m.manager_phone || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{m.shift || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {m.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/food-managers/edit/${m.id}`)}
                    className="text-indigo-600 hover:underline text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
