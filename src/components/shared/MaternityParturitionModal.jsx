import React, { useState } from 'react';
import { Baby, Heart, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import maternityService from '../../service/maternityService';
import { toast } from 'sonner';

export default function MaternityParturitionModal({ motherPatient, admission, isOpen, onClose, onComplete }) {
  const [deliveryMode, setDeliveryMode] = useState('NORMAL_VAGINAL');
  const [bloodLossMl, setBloodLossMl] = useState(250);
  const [isTwinDelivery, setIsTwinDelivery] = useState(false);

  // Twin 1 state
  const [twin1Gender, setTwin1Gender] = useState('Male');
  const [twin1Weight, setTwin1Weight] = useState(3100);
  const [twin1Destination, setTwin1Destination] = useState('ROOMING_IN');

  // Twin 2 state
  const [twin2Gender, setTwin2Gender] = useState('Female');
  const [twin2Weight, setTwin2Weight] = useState(1850);
  const [twin2Destination, setTwin2Destination] = useState('NICU');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !motherPatient) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const babies = [
        {
          gender: twin1Gender,
          birth_weight_grams: parseInt(twin1Weight, 10),
          destination: twin1Destination,
          apgar_1min: 8,
          apgar_5min: 9,
        },
      ];

      if (isTwinDelivery) {
        babies.push({
          gender: twin2Gender,
          birth_weight_grams: parseInt(twin2Weight, 10),
          destination: twin2Destination,
          apgar_1min: 5,
          apgar_5min: 7,
        });
      }

      const res = await maternityService.recordDeliveryAndSplit({
        mother_patient_id: motherPatient.id,
        mother_admission_id: admission?.id || null,
        delivery_mode: deliveryMode,
        blood_loss_ml: parseInt(bloodLossMl, 10),
        babies,
      });

      toast.success(
        `Parturition recorded! ${babies.length} newborn record(s) and distinct UHID(s) created.`
      );
      if (onComplete) onComplete(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Delivery split failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-800 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-pink-600" />
            <h3 className="text-xl font-bold text-slate-900">Labor & Parturition Split Engine</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mother Summary */}
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-pink-900 block text-sm">
                Mother: {motherPatient.first_name} {motherPatient.last_name} ({motherPatient.patient_code})
              </span>
              <span className="text-pink-700">Blood Group: {motherPatient.blood_group || 'Rh-Negative Profile'}</span>
            </div>
            <div className="text-right">
              <span className="bg-pink-200 text-pink-800 px-2.5 py-1 rounded-full font-bold">
                Parturition Split Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Delivery Mode *
              </label>
              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500"
              >
                <option value="NORMAL_VAGINAL">Normal Vaginal Delivery (SVD)</option>
                <option value="CESAREAN_ELECTIVE">Elective LSCS</option>
                <option value="CESAREAN_EMERGENCY">Emergency LSCS</option>
                <option value="ASSISTED_FORCEPS">Assisted Forceps Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Estimated Blood Loss (mL)
              </label>
              <input
                type="number"
                value={bloodLossMl}
                onChange={(e) => setBloodLossMl(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="isTwin"
              checked={isTwinDelivery}
              onChange={(e) => setIsTwinDelivery(e.target.checked)}
              className="h-4 w-4 text-pink-600 rounded"
            />
            <label htmlFor="isTwin" className="text-xs font-bold text-slate-800">
              Multi-Birth Parturition (Twins / Multiples Delivery)
            </label>
          </div>

          {/* Baby 1 Card */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-pink-500" />
              {isTwinDelivery ? 'Twin 1 (First Born)' : 'Newborn Details'}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Gender</label>
                <select
                  value={twin1Gender}
                  onChange={(e) => setTwin1Gender(e.target.value)}
                  className="w-full text-xs border rounded p-1.5"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Ambiguous">Ambiguous</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Weight (g)</label>
                <input
                  type="number"
                  value={twin1Weight}
                  onChange={(e) => setTwin1Weight(e.target.value)}
                  className="w-full text-xs border rounded p-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Destination</label>
                <select
                  value={twin1Destination}
                  onChange={(e) => setTwin1Destination(e.target.value)}
                  className="w-full text-xs border rounded p-1.5"
                >
                  <option value="ROOMING_IN">Rooming-In (Mother's Bed)</option>
                  <option value="NICU">NICU (Incubator Required)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Baby 2 Card (if Twin) */}
          {isTwinDelivery && (
            <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/40">
              <h4 className="text-xs font-bold uppercase text-amber-800 mb-2 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-amber-600" />
                Twin 2 (Second Born - Preterm / Low Birth Weight)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Gender</label>
                  <select
                    value={twin2Gender}
                    onChange={(e) => setTwin2Gender(e.target.value)}
                    className="w-full text-xs border rounded p-1.5"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Ambiguous">Ambiguous</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Weight (g)</label>
                  <input
                    type="number"
                    value={twin2Weight}
                    onChange={(e) => setTwin2Weight(e.target.value)}
                    className="w-full text-xs border rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Destination</label>
                  <select
                    value={twin2Destination}
                    onChange={(e) => setTwin2Destination(e.target.value)}
                    className="w-full text-xs border rounded p-1.5"
                  >
                    <option value="NICU">NICU (Immediate Incubator Bed Lock)</option>
                    <option value="ROOMING_IN">Rooming-In (Mother's Bed)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 shadow disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Baby className="h-4 w-4" />
              {isSubmitting ? 'Splitting Parturition...' : 'Record Parturition & Allocate UHIDs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

