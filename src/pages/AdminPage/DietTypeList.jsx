import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import foodService from "../../service/foodService";

const inputCls = "w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = { breakfast: "Breakfast 🌅", lunch: "Lunch ☀️", dinner: "Dinner 🌙", snack: "Snack 🍎" };

const EMPTY = { name: "", description: "", breakfast: "", lunch: "", dinner: "", snack: "" };

export default function DietTypeList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await foodService.getAllDietTypes();
      setItems(res.data?.data || []);
    } catch { toast.error("Failed to load diet types"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (item) => {
    setForm({ name: item.name || "", description: item.description || "", breakfast: item.breakfast || "", lunch: item.lunch || "", dinner: item.dinner || "", snack: item.snack || "" });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editId) {
        await foodService.updateDietType(editId, form);
        toast.success("Diet type updated");
      } else {
        await foodService.createDietType(form);
        toast.success("Diet type created");
      }
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this diet type?")) return;
    try {
      await foodService.deleteDietType(id);
      toast.success("Diet type deactivated");
      fetch();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={20} className="text-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Diet Types</h2>
            <p className="text-xs text-gray-500">Define meal menus for each diet type</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="p-2 rounded-md border border-gray-200 bg-white text-gray-500"><RefreshCw size={14} /></button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#506EE4] text-white hover:bg-[#3f56c2]">
            <Plus size={14} /> Add Diet Type
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editId ? "Edit Diet Type" : "New Diet Type"}</h3>
              <p className="text-xs text-gray-500 mt-1">Define the meal menu for each time of day</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Diet Type Name *</label>
                <input className={inputCls} placeholder="e.g. Diabetic, Regular, Liquid" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Description</label>
                <input className={inputCls} placeholder="Brief description" value={form.description} onChange={e => set("description", e.target.value)} />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Meal Menus</p>
                <div className="space-y-3">
                  {MEAL_TYPES.map(type => (
                    <div key={type} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{MEAL_LABELS[type]}</label>
                      <input className={inputCls} placeholder={`${type} menu items`} value={form[type]} onChange={e => set(type, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-400">No diet types yet. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!item.is_active ? "opacity-60" : ""}`}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {MEAL_TYPES.map(type => (
                  <div key={type} className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-20 shrink-0 text-xs capitalize">{type}</span>
                    <span className="text-gray-700 text-xs">{item[type] || <span className="text-gray-300 italic">Not set</span>}</span>
                  </div>
                ))}
              </div>
              {!item.is_active && (
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center">Inactive</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
