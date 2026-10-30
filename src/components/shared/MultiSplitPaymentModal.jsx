import React, { useState } from 'react';
import { CreditCard, DollarSign, QrCode, ShieldCheck, CheckCircle2, X, Plus, Trash2 } from 'lucide-react';
import paymentsService from '../../service/paymentsService';
import { toast } from 'sonner';

export default function MultiSplitPaymentModal({ billing, isOpen, onClose, onPaymentComplete }) {
  const [splits, setSplits] = useState([
    { method: 'CASH', amount: '' },
    { method: 'UPI', amount: '', utr_number: '' },
  ]);
  const [isSchemeBilling, setIsSchemeBilling] = useState(false);
  const [schemeType, setSchemeType] = useState('PMJAY');
  const [schemePackageCode, setSchemePackageCode] = useState('MC001A');
  const [schemeCap, setSchemeCap] = useState(35000);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !billing) return null;

  const totalBill = parseFloat(billing.total_amount || 0);
  const currentPaid = parseFloat(billing.paid_amount || 0);
  const currentDue = parseFloat(billing.due_amount || totalBill - currentPaid);

  const splitSum = splits.reduce((sum, sp) => sum + (parseFloat(sp.amount) || 0), 0);
  const remainingAfterSplits = Math.max(0, currentDue - splitSum);

  const handleAddSplit = () => {
    setSplits([...splits, { method: 'CREDIT_CARD', amount: '' }]);
  };

  const handleRemoveSplit = (idx) => {
    setSplits(splits.filter((_, i) => i !== idx));
  };

  const handleSplitChange = (idx, field, value) => {
    const updated = [...splits];
    updated[idx][field] = value;
    setSplits(updated);
  };

  const handleSettleSplitPayment = async (e) => {
    e.preventDefault();
    if (splitSum <= 0) {
      toast.error('Enter at least one valid payment amount.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await paymentsService.processSplitPayment({
        billing_id: billing.id,
        patient_id: billing.patient_id,
        splits: splits.filter((s) => parseFloat(s.amount) > 0),
        idempotency_key: `SPLIT-${billing.id}-${Date.now()}`,
      });

      toast.success(`Payment of Rs ${splitSum.toFixed(2)} settled successfully across channels!`);
      if (onPaymentComplete) onPaymentComplete(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Payment processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettleScheme = async () => {
    setIsSubmitting(true);
    try {
      const res = await paymentsService.settleSchemePackage({
        billing_id: billing.id,
        admission_id: billing.admission_id,
        patient_id: billing.patient_id,
        scheme_type: schemeType,
        scheme_package_code: schemePackageCode,
        scheme_package_cap: schemeCap,
        internal_total_amount: totalBill,
      });

      toast.success(
        `PMJAY Scheme settled! Package capped at Rs ${schemeCap}. Patient payable: Rs 0.00.`
      );
      if (onPaymentComplete) onPaymentComplete(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Scheme settlement failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-800 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">
              {isSchemeBilling ? 'Government Scheme Package Settlement' : 'Multi-Split Payment Terminal'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex justify-between items-center text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase block">Invoice #{billing.billing_no}</span>
            <span className="font-bold text-slate-900 text-sm">Patient: {billing.customer_name || 'Inpatient'}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Due</span>
            <span className="text-base font-bold text-emerald-600 font-mono">Rs {currentDue.toFixed(2)}</span>
          </div>
        </div>

        {/* Scheme Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setIsSchemeBilling(false)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
              !isSchemeBilling
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            Multi-Mode Split (Cash/UPI/Card)
          </button>
          <button
            type="button"
            onClick={() => setIsSchemeBilling(true)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
              isSchemeBilling
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            PMJAY / CGHS Zero-Balance Scheme
          </button>
        </div>

        {isSchemeBilling ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Ayushman Bharat / CGHS Protection:</strong> Hospital surplus charges are absorbed automatically. Patient pays <strong>Rs 0.00</strong>.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Scheme</label>
                <select
                  value={schemeType}
                  onChange={(e) => setSchemeType(e.target.value)}
                  className="w-full text-xs border rounded p-2"
                >
                  <option value="PMJAY">PMJAY (Ayushman Bharat)</option>
                  <option value="CGHS">CGHS Central Government</option>
                  <option value="ESI">ESIC Employee State Insurance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Package Tariff Cap (Rs)</label>
                <input
                  type="number"
                  value={schemeCap}
                  onChange={(e) => setSchemeCap(Number(e.target.value))}
                  className="w-full text-xs border rounded p-2"
                />
              </div>
            </div>

            <div className="bg-slate-50 border rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Internal Hospital Unbundled Total:</span>
                <span className="font-bold">Rs {totalBill.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-indigo-600">
                <span>Hospital Absorbed Surplus Discount:</span>
                <span className="font-bold">- Rs {Math.max(0, totalBill - schemeCap).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t pt-1 text-sm">
                <span>Patient Out-of-Pocket Balance:</span>
                <span>Rs 0.00</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-sm text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSettleScheme}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Settling...' : 'Seal PMJAY Zero-Balance Invoice'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSettleSplitPayment} className="space-y-3">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {splits.map((sp, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border">
                  <select
                    value={sp.method}
                    onChange={(e) => handleSplitChange(idx, 'method', e.target.value)}
                    className="text-xs border rounded p-1.5 font-semibold"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="TPA_INSURANCE">TPA / Insurance</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount (Rs)"
                    value={sp.amount}
                    onChange={(e) => handleSplitChange(idx, 'amount', e.target.value)}
                    className="text-xs border rounded p-1.5 flex-1 font-mono"
                  />
                  {sp.method === 'UPI' && (
                    <input
                      type="text"
                      placeholder="UTR / Ref No"
                      value={sp.utr_number || ''}
                      onChange={(e) => handleSplitChange(idx, 'utr_number', e.target.value)}
                      className="text-xs border rounded p-1.5 w-28 font-mono"
                    />
                  )}
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSplit(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSplit}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Another Split Channel
            </button>

            <div className="border-t pt-2 flex justify-between text-xs">
              <span>Remaining Balance:</span>
              <span className={`font-mono font-bold ${remainingAfterSplits === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                Rs {remainingAfterSplits.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-sm text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : `Settle Rs ${splitSum.toFixed(2)} Split`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

