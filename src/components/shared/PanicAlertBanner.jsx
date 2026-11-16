import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Activity, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import labTestOrderService from '../../service/labtestorderService';
import websocketService from '../../service/websocketService';
import { toast } from 'sonner';

export default function PanicAlertBanner() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [ackNotes, setAckNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick action templates for emergency physician response
  const quickActionTemplates = [
    'IV Calcium Gluconate administered STAT',
    'ICU team alerted & bedside consult ordered',
    'Urgent repeat specimen requested for verification',
    'Attending physician personally notified',
    'Emergency nephrology consult requested',
    'Medication adjusted per critical lab protocol',
  ];

  // Initial single-fetch on mount: no recurring HTTP polling
  const fetchInitialAlerts = useCallback(async () => {
    try {
      const res = await labTestOrderService.getActivePanicAlerts();
      if (res && res.data && Array.isArray(res.data)) {
        setActiveAlerts(res.data);
      }
    } catch (err) {
      // Gracefully handle if offline or backend unavailable
    }
  }, []);

  useEffect(() => {
    fetchInitialAlerts();

    // Subscribe to real-time WebSocket push notifications
    const unsubscribe = websocketService.subscribe((event) => {
      if (event.type === 'PANIC_ALERT_DISPATCHED' && event.data) {
        const newAlert = event.data;
        setActiveAlerts((prev) => {
          const exists = prev.some((a) => a.id === newAlert.id);
          if (exists) return prev;
          return [newAlert, ...prev];
        });
        toast.error(`Critical Panic Alert: ${newAlert.test_name} (${newAlert.result_value}) breached critical threshold!`);
      } else if (event.type === 'PANIC_ALERT_ACKNOWLEDGED' && event.data) {
        const ackId = event.data.id;
        setActiveAlerts((prev) => prev.filter((a) => a.id !== ackId));
        setSelectedAlert((curr) => (curr && curr.id === ackId ? null : curr));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchInitialAlerts]);

  const handleAcknowledge = async () => {
    if (!ackNotes.trim()) {
      toast.error('Please enter clinical acknowledgment notes / action taken.');
      return;
    }
    setIsSubmitting(true);
    try {
      await labTestOrderService.acknowledgePanicAlert(selectedAlert.id, { notes: ackNotes });
      toast.success('Panic alert acknowledged and archived in audit trail.');
      
      // Optimistic local state update
      const ackedId = selectedAlert.id;
      setActiveAlerts((prev) => prev.filter((a) => a.id !== ackedId));
      setSelectedAlert(null);
      setAckNotes('');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to acknowledge alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTemplate = (template) => {
    if (!ackNotes) {
      setAckNotes(template);
    } else {
      setAckNotes((prev) => `${prev.trim()}; ${template}`);
    }
  };

  if (!activeAlerts || activeAlerts.length === 0) return null;

  return (
    <>
      {/* Alert Header Strip */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 border-b border-red-700 select-none animate-in fade-in duration-300">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-red-800/80 ring-1 ring-white/20 animate-pulse">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="font-bold tracking-wide uppercase text-[11px] bg-red-900/90 text-red-100 px-2 py-0.5 rounded border border-red-500/40">
              CRITICAL PANIC VALUE ALERT ({activeAlerts.length})
            </span>
            <span className="text-xs sm:text-sm font-medium text-red-50">
              Immediate statutory intervention required: Critical laboratory thresholds breached.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeAlerts.slice(0, 3).map((alert) => (
            <button
              key={alert.id}
              onClick={() => {
                setSelectedAlert(alert);
                setAckNotes('');
              }}
              className="bg-white hover:bg-red-50 text-red-700 active:scale-95 text-xs font-semibold px-3 py-1 rounded-md shadow-xs border border-red-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="h-3.5 w-3.5 text-red-600" />
              <span>Review {alert.test_name}: <strong className="text-red-900">{alert.result_value}</strong></span>
            </button>
          ))}
        </div>
      </div>

      {/* Radix UI Portaled Dialog: escapes any parent backdrop-filter or sticky constraints */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 border-red-200 shadow-2xl rounded-2xl overflow-hidden"
        >
          {selectedAlert && (
            <>
              {/* Fixed Header */}
              <div className="p-5 pb-4 border-b border-slate-100 bg-red-50/60 shrink-0">
                <DialogHeader className="text-left space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-red-100 text-red-600 ring-4 ring-red-50 shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-red-700 leading-tight">
                        Critical Panic Alert Intervention
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-500 mt-0.5">
                        Statutory clinical review & immediate physician action required
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Scrollable Body Container */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Patient & Metric Spotlight Card */}
                <div className="bg-gradient-to-br from-red-50/80 via-white to-red-50/40 border border-red-200/80 rounded-xl p-4 text-sm shadow-2xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Patient UHID</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {selectedAlert.patient?.patient_id || selectedAlert.patient_code || 'PAT-EMERGENCY'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Diagnostic Test</span>
                      <span className="font-bold text-slate-900">{selectedAlert.test_name}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-100/70 border border-red-200">
                      <span className="text-[11px] text-red-800 uppercase font-bold block">Reported Panic Value</span>
                      <span className="font-extrabold text-red-700 text-lg">
                        {selectedAlert.result_value} <span className="text-xs font-normal text-red-600">{selectedAlert.units || ''}</span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100/70 border border-slate-200">
                      <span className="text-[11px] text-slate-600 uppercase font-bold block">Critical Threshold</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {selectedAlert.critical_thresholds || selectedAlert.reference_range || 'Out of bounds'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick-Pick Response Chips */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Quick Action Response Templates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickActionTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddTemplate(template)}
                        className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        + {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Physician Acknowledgment & Urgent Actions Taken <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={ackNotes}
                    onChange={(e) => setAckNotes(e.target.value)}
                    placeholder="Describe emergency medication administered, specialist consultation alerted, repeat specimen ordered, or immediate clinical instructions..."
                    rows={3}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
                <DialogFooter className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isSubmitting ? 'Acknowledging...' : 'Confirm Clinical Acknowledgment'}
                  </button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
