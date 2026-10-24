import React from "react";
import { 
  FileText, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  User, 
  Calendar, 
  AlertCircle 
} from "lucide-react";

export default function PatientOverviewFields({ patient, history }) {
  const encounter = history?.latestEncounter;
  const diagnosis = history?.latestDiagnosis;
  const admission = history?.latestAdmission;
  const vitals = history?.latestVital;
  const note = history?.latestNote;

  // Lab Orders from API
  const labOrders = history?.labOrders || [];

  // Flattened lab test items from all orders
  const labTests = labOrders.flatMap((order) =>
    (order?.items || []).map((item) => ({
      orderNo: order.order_no,
      status: order.status,
      priority: order.priority,
      sampleType: item?.sample_type,
      testName: item?.test_name,
      result: item?.result_value,
      resultUrl: item?.result_file_url,
    }))
  );

  const medicines = history?.medications || [];

  return (
    <div className="w-full space-y-5">
      {/* 1. LATEST CONSULTATION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Stethoscope size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Latest Clinical Consultation
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {encounter?.encounter_date
                  ? `Conducted on ${new Date(encounter.encounter_date).toLocaleDateString("en-IN", { dateStyle: "long" })}`
                  : "Latest Recorded Medical Encounter"}
              </p>
            </div>
          </div>

          {encounter?.doctor && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <User size={13} className="text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">
                Dr. {encounter.doctor.first_name} {encounter.doctor.last_name}
              </span>
            </div>
          )}
        </div>

        {/* Clinical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chief Complaint */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reason for Consultation (Chief Complaint)
            </label>
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              {encounter?.chief_complaint || "No specific complaints recorded for this session."}
            </div>
          </div>

          {/* Diagnosis & Findings */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Diagnosis & Clinical Findings
              </label>
              {diagnosis?.icd_code && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  ICD: {diagnosis.icd_code}
                </span>
              )}
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
              {diagnosis?.description || "Awaiting definitive diagnosis or pending investigation results."}
            </div>
          </div>

          {/* Review Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Clinical Review Notes & Observations
            </label>
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              {note?.note || "No review notes attached to this session."}
            </div>
          </div>

          {/* Treatment Plan */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Treatment Plan & Next Actions
            </label>
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              {encounter?.plan || "Standard supportive care. Follow-up as advised."}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL SUMMARY PANELS: LAB TESTS & ACTIVE MEDICINES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Lab Tests Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FlaskConical size={15} />
                </div>
                <h3 className="font-black text-sm text-slate-900">Diagnostic Investigations</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {labTests.length} Tests
              </span>
            </div>

            <div className="mt-3.5 space-y-2">
              {labTests.length > 0 ? (
                labTests.slice(0, 4).map((test, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">
                        {test.testName || test.sampleType || "Pathology Test"}
                      </p>
                      {test.sampleType && <p className="text-[10px] text-slate-400 mt-0.5">Sample: {test.sampleType}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {test.result && (
                        <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {test.result}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        test.status?.toLowerCase() === "completed" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {test.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No laboratory investigations ordered.</p>
              )}
            </div>
          </div>

          {labTests.length > 4 && (
            <p className="text-[11px] text-indigo-600 font-bold text-center pt-2">
              + {labTests.length - 4} more test results (view in Lab Diagnostics tab)
            </p>
          )}
        </div>

        {/* Prescribed Medicines Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Pill size={15} />
                </div>
                <h3 className="font-black text-sm text-slate-900">Active Prescriptions</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {medicines.length} Medicines
              </span>
            </div>

            <div className="mt-3.5 space-y-2">
              {medicines.length > 0 ? (
                medicines.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">
                        {m?.medicine_name || "Prescribed Medicine"}
                      </p>
                      {m?.dosage && <p className="text-[10px] text-slate-400 mt-0.5">Dosage: {m.dosage}</p>}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {m?.frequency || "As Prescribed"}
                      </span>
                      {m?.duration && <p className="text-[10px] text-slate-400 mt-1">{m.duration}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No active prescriptions recorded.</p>
              )}
            </div>
          </div>

          {medicines.length > 4 && (
            <p className="text-[11px] text-indigo-600 font-bold text-center pt-2">
              + {medicines.length - 4} more medicines (view in Prescriptions tab)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

