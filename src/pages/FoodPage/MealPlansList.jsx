import React, { useEffect, useState } from "react";
import { RefreshCw, UtensilsCrossed, Pencil } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import foodService from "../../service/foodService";

const STATUS_COLORS = {
  pending: "bg-orange-100 text-orange-700",
  prepared: "bg-blue-100 text-blue-700",
  distributed: "bg-green-100 text-green-700",
  skipped: "bg-gray-100 text-gray-500",
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_ICONS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

export default function MealPlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [dietTypes, setDietTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
    foodService.getAllDietTypes({ is_active: true })
      .then(res => setDietTypes(res.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await foodService.getAllMealPlans({ limit: 100 });
      setPlans(res.data?.data?.data || res.data?.data || []);
    } catch { toast.error("Failed to load meal plans"); }
    finally { setLoading(false); }
  };

  const handleUpdateDietType = async () => {
    if (!editPlan?.diet_type_id) return toast.error("Select a diet type");
    setSaving(true);
    try {
      await foodService.updateMealPlan(editPlan.id, { diet_type_id: editPlan.diet_type_id });
      toast.success("Meal plan updated");
      setEditPlan(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={20} className="text-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Patient Meal Plans</h2>
            <p className="text-xs text-gray-500">Meal plans auto-created at admission time</p>
          </div>
        </div>
        <button onClick={fetchPlans} className="p-2 rounded-md border border-gray-200 bg-white text-gray-500">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Edit Diet Type Modal */}
      {editPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Change Diet Type</h3>
              <p className="text-xs text-gray-500 mt-1">
                Patient: {editPlan.patient ? `${editPlan.patient.first_name} ${editPlan.patient.last_name}` : "—"}
              </p>
            </div>
            <div className="p-5 space-y-3">
              {dietTypes.map(dt => (
                <button key={dt.id} type="button"
                  onClick={() => setEditPlan(p => ({ ...p, diet_type_id: dt.id }))}
                  className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${editPlan.diet_type_id === dt.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="font-medium text-gray-800">{dt.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-gray-500">
                    {MEAL_TYPES.map(t => dt[t] && <span key={t}>{MEAL_ICONS[t]} {dt[t]}</span>)}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setEditPlan(null)} className="px-5 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
              <button onClick={handleUpdateDietType} disabled={saving}
                className="px-6 py-2 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      {loading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="py-10 text-center text-gray-400">No meal plans yet. They are created automatically when a patient is admitted with a diet type selected.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => {
            const dt = plan.diet_type;
            return (
              <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {plan.patient ? `${plan.patient.first_name} ${plan.patient.last_name}` : "—"}
                    </p>
                    <p className="text-xs text-gray-400">{plan.patient?.patient_code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                      {dt?.name || "—"}
                    </span>
                    <button onClick={() => setEditPlan({ id: plan.id, patient: plan.patient, diet_type_id: plan.diet_type_id })}
                      className="p-1 text-gray-400 hover:text-indigo-600">
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {MEAL_TYPES.map(type => (
                    <div key={type} className="flex gap-2 items-start">
                      <span className="text-sm w-6">{MEAL_ICONS[type]}</span>
                      <div>
                        <span className="text-xs font-medium text-gray-500 capitalize">{type}: </span>
                        <span className="text-xs text-gray-700">{dt?.[type] || <span className="text-gray-300 italic">Not set</span>}</span>
                      </div>
                    </div>
                  ))}
                  {plan.allergies && (
                    <div className="mt-2 text-xs text-red-500">⚠️ Allergies: {plan.allergies}</div>
                  )}
                </div>
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400">
                  From {dayjs(plan.valid_from).format("MMM D, YYYY")}
                  {plan.valid_to && ` → ${dayjs(plan.valid_to).format("MMM D, YYYY")}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
