import React, { useState } from 'react';
import { LogOut, CheckCircle2, ShieldCheck, X, FileText, Bed } from 'lucide-react';
import admissionsService from '../../service/addmissionsService';
import { toast } from 'sonner';

export default function DecoupledDischargeModal({ admission, isOpen, onClose, onDischargeComplete }) {
  const [dischargeType, setDischargeType] = useState('REGULAR');
  const [dischargeReason, setDischargeReason] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [retainBedForClearance, setRetainBedForClearance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gatePassIssued, setGatePassIssued] = useState(null);

  if (!isOpen || !admission) return null;

  const handleClinicalDischarge = async (e) => {
    e.preventDefault();
    if (!finalDiagnosis) {
      toast.error('Final diagnosis is required for clinical discharge');
      return;
    }
    if (dischargeType === 'LAMA' && !dischargeReason) {
      toast.error('Detailed clinical explanation and risk warning notes required for LAMA departure.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await admissionsService.dischargeAdmission(admission.id, {
        discharge_type: dischargeType,
        discharge_reason: dischargeReason,
        final_diagnosis: finalDiagnosis,
        retain_bed_until_departure: retainBedForClearance,
      });

      toast.success(
        retainBedForClearance
          ? 'Clinical discharge completed. Bed retained for pharmacy & billing clearance.'
          : 'Patient fully discharged and bed released.'
      );

      if (onDischargeComplete) onDischargeComplete(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Discharge failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPhysicalDeparture = async () => {
    setIsSubmitting(true);
    try {
      const res = await admissionsService.recordPhysicalDeparture(admission.id);
      setGatePassIssued(res.data);
      toast.success(`Gate pass ${res.data?.gate_pass_number || ''} generated! Bed released to housekeeping.`);
      if (onDischargeComplete) onDischargeComplete(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to record physical departure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-800 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <LogOut className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-900">4-Stage Decoupled Discharge Pipeline</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pipeline Visual Stepper */}
        <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs">
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-2 rounded-lg font-semibold">
            1. Clinical Approval
          </div>
          <div className="bg-slate-50 border border-slate-200 text-slate-600 p-2 rounded-lg">
            2. Pharmacy / Billing
          </div>
          <div className="bg-slate-50 border border-slate-200 text-slate-600 p-2 rounded-lg">
            3. Gate Pass
          </div>
          <div className="bg-slate-50 border border-slate-200 text-slate-600 p-2 rounded-lg">
            4. Bed Cleaning
          </div>
        </div>

        {gatePassIssued ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center my-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-emerald-800">Physical Departure Gate Pass Issued</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Gate Pass Number: <span className="font-mono font-bold">{gatePassIssued.gate_pass_number}</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Bed has been marked unoccupied and transferred to Housekeeping workflow.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleClinicalDischarge} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Discharge Classification *
              </label>
              <select
                value={dischargeType}
                onChange={(e) => setDischargeType(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="REGULAR">Regular Clinical Discharge (Physician Approved)</option>
                <option value="LAMA">LAMA (Left Against Medical Advice)</option>
                <option value="ABSCONDED">Absconded (Patient Left Without Discharge)</option>
                <option value="TRANSFER">Transfer to Higher Facility</option>
                <option value="DEATH">Deceased / Mortuary Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Final Clinical Diagnosis *
              </label>
              <input
                type="text"
                required
                value={finalDiagnosis}
                onChange={(e) => setFinalDiagnosis(e.target.value)}
                placeholder="e.g. Acute appendicitis post laparoscopic appendectomy"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Discharge Notes / Clinical Summary / LAMA Risks Explained
              </label>
              <textarea
                value={dischargeReason}
                onChange={(e) => setDischargeReason(e.target.value)}
                rows={2}
                placeholder="Document clinical state, medication reconciliation, or patient refusal warnings..."
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <input
                type="checkbox"
                id="retainBed"
                checked={retainBedForClearance}
                onChange={(e) => setRetainBedForClearance(e.target.checked)}
                className="mt-1 h-4 w-4 text-indigo-600 rounded border-slate-300"
              />
              <label htmlFor="retainBed" className="text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">
                  Retain Bed Until Physical Departure (Decoupled Bed Management)
                </span>
                Prevents double-booking this bed while patient waits for pharmacy discharge medicines, billing settlement, or transport.
              </label>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                type="button"
                onClick={handleRecordPhysicalDeparture}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 underline"
              >
                <Bed className="h-4 w-4" /> Issue Gate Pass & Release Bed Directly
              </button>
              <div className="flex gap-2">
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Clinical Discharge'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

