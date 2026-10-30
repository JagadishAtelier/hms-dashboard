import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react';
import labTestOrderService from '../../service/labtestorderService';
import { toast } from 'sonner';

export default function PanicAlertBanner() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [ackNotes, setAckNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await labTestOrderService.getActivePanicAlerts();
      if (res && res.data) {
        setActiveAlerts(res.data);
      }
    } catch (err) {
      // Graceful fallback if offline or backend not running locally
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async () => {
    if (!ackNotes.trim()) {
      toast.error('Please enter clinical acknowledgment notes / action taken.');
      return;
    }
    setIsSubmitting(true);
    try {
      await labTestOrderService.acknowledgePanicAlert(selectedAlert.id, { notes: ackNotes });
      toast.success('Panic alert acknowledged and archived in audit trail.');
      setSelectedAlert(null);
      setAckNotes('');
      fetchAlerts();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to acknowledge alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeAlerts || activeAlerts.length === 0) return null;

  return (
    <>
      <div className="bg-red-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-yellow-300" />
          <div>
            <span className="font-bold tracking-wide uppercase text-xs bg-red-800 px-2 py-0.5 rounded mr-2">
              CRITICAL PANIC VALUE ALERT ({activeAlerts.length})
            </span>
            <span className="text-sm font-medium">
              Immediate clinical intervention required: Critical laboratory thresholds breached.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeAlerts.slice(0, 2).map((alert) => (
            <button
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className="bg-white text-red-700 hover:bg-red-50 text-xs font-semibold px-3 py-1 rounded shadow transition cursor-pointer"
            >
              Review {alert.test_name}: {alert.result_value}
            </button>
          ))}
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-bold text-red-700">Critical Panic Alert Intervention</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 mb-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Patient Code</span>
                  <span className="font-semibold text-slate-900">{selectedAlert.patient_code || 'PAT-EMERGENCY'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Diagnostic Test</span>
                  <span className="font-semibold text-slate-900">{selectedAlert.test_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Reported Panic Value</span>
                  <span className="font-bold text-red-600 text-base">{selectedAlert.result_value}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Standard Reference Range</span>
                  <span className="font-medium text-slate-700">{selectedAlert.reference_range || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Physician Acknowledgment & Urgent Actions Taken *
              </label>
              <textarea
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                placeholder="e.g. IV Calcium Gluconate administered immediately, 10U regular insulin with 50% dextrose infused, ICU bed alerted."
                rows={3}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? 'Acknowledging...' : 'Confirm Clinical Acknowledgment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

