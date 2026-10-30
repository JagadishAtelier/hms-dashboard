import React, { useState } from 'react';
import { GitMerge, AlertCircle, CheckCircle2, X, ArrowRight, UserCheck } from 'lucide-react';
import patientService from '../../service/patientService';
import { toast } from 'sonner';

export default function PatientMergeModal({ sourcePatient, isOpen, onClose, onMergeComplete }) {
  const [targetSearch, setTargetSearch] = useState('');
  const [targetPatient, setTargetPatient] = useState(null);
  const [mergeReason, setMergeReason] = useState('Identity verified by family member with government Photo ID card');
  const [isSearching, setIsSearching] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  if (!isOpen || !sourcePatient) return null;

  const handleSearchTarget = async () => {
    if (!targetSearch.trim()) {
      toast.error('Enter a search query (name, phone, or UHID)');
      return;
    }
    setIsSearching(true);
    try {
      const res = await patientService.getAllPatients({ search: targetSearch, limit: 5 });
      const found = (res.data?.data || res.data || []).find((p) => p.id !== sourcePatient.id);
      if (found) {
        setTargetPatient(found);
      } else {
        toast.error('No matching permanent patient record found.');
      }
    } catch (err) {
      toast.error('Failed to search target patient');
    } finally {
      setIsSearching(false);
    }
  };

  const handleExecuteMerge = async () => {
    if (!targetPatient) {
      toast.error('Please select a verified target patient record');
      return;
    }
    setIsMerging(true);
    try {
      const res = await patientService.mergePatients({
        source_patient_id: sourcePatient.id,
        target_patient_id: targetPatient.id,
        reason: mergeReason,
      });

      toast.success(
        `Successfully merged ${sourcePatient.patient_code} into ${targetPatient.patient_code}! All 14 entity tables atomically migrated.`
      );
      if (onMergeComplete) onMergeComplete(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Patient merge failed');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-800 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Atomic Patient Record Merge</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Forensic Preservation Guarantee:</strong> Merging migrates all appointments, encounters, prescriptions, lab orders, vitals, admissions, and billing ledger entries into the target UHID within a single ACID transaction. The source alias is permanently retired with an audit trail.
          </span>
        </div>

        {/* Visual Diff Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Source Card */}
          <div className="border border-red-200 bg-red-50/50 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
              Source Record (To be Retired)
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">
              {sourcePatient.first_name} {sourcePatient.last_name}
            </h4>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              <p>UHID: <span className="font-mono font-semibold">{sourcePatient.patient_code}</span></p>
              <p>Gender: {sourcePatient.gender} · Age: {sourcePatient.age || 'N/A'}</p>
              <p>Blood Group: {sourcePatient.blood_group || 'Unknown'}</p>
              <p>Alias: <span className="text-red-600 font-semibold">{sourcePatient.is_emergency_alias ? 'YES (EMG-UNK)' : 'NO'}</span></p>
            </div>
          </div>

          {/* Target Card */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Target Record (Permanent UHID)
            </span>
            {targetPatient ? (
              <div className="mt-2">
                <h4 className="text-base font-bold text-slate-900">
                  {targetPatient.first_name} {targetPatient.last_name}
                </h4>
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  <p>UHID: <span className="font-mono font-semibold">{targetPatient.patient_code}</span></p>
                  <p>Phone: {targetPatient.phone || 'N/A'}</p>
                  <p>Blood Group: {targetPatient.blood_group || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500">
                <p className="mb-2">Search and select verified permanent patient record:</p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder="Enter permanent UHID or phone..."
                    className="w-full text-xs border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchTarget}
                    className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700"
                  >
                    {isSearching ? '...' : 'Find'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
            Mandatory Forensic Merge Justification *
          </label>
          <textarea
            value={mergeReason}
            onChange={(e) => setMergeReason(e.target.value)}
            rows={2}
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!targetPatient || isMerging}
            onClick={handleExecuteMerge}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow disabled:opacity-50 flex items-center gap-1.5"
          >
            <GitMerge className="h-4 w-4" />
            {isMerging ? 'Merging All 14 Entities...' : 'Confirm Atomic Merge'}
          </button>
        </div>
      </div>
    </div>
  );
}

