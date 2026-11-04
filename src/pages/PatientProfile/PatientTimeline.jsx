import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Bed,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  FlaskConical,
  Heart,
  Pill,
  Printer,
  RefreshCw,
  Scissors,
  Search,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  User,
  AlertCircle
} from "lucide-react";
import patientService from "../../service/patientService.js";

const CATEGORY_CONFIG = {
  ALL: { label: "All Events", icon: Activity, color: "text-slate-600", bg: "bg-slate-100" },
  ADMISSION: { label: "Admissions & Discharges", icon: Bed, color: "text-blue-600", bg: "bg-blue-100" },
  ENCOUNTER: { label: "Clinical Consultations", icon: Stethoscope, color: "text-indigo-600", bg: "bg-indigo-100" },
  VITAL_SIGN: { label: "Vital Signs", icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
  PRESCRIPTION: { label: "Prescriptions", icon: Pill, color: "text-purple-600", bg: "bg-purple-100" },
  LAB_RESULT: { label: "Lab Diagnostics", icon: FlaskConical, color: "text-emerald-600", bg: "bg-emerald-100" },
  PHYSICIAN_ROUNDING: { label: "SOAP Rounds", icon: Activity, color: "text-teal-600", bg: "bg-teal-100" },
  SURGERY: { label: "Surgeries & OT", icon: Scissors, color: "text-amber-600", bg: "bg-amber-100" },
  PANIC_ALERT: { label: "Panic Alerts", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-100" },
  FOLLOW_UP: { label: "Follow-ups", icon: CalendarCheck, color: "text-cyan-600", bg: "bg-cyan-100" },
};

const PatientTimeline = ({ patientId, patientInfo }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvents, setExpandedEvents] = useState({});

  const fetchTimeline = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await patientService.getTimeline(patientId, {
        limit: 300,
      });
      if (res.success) {
        setTimelineData(res.data);
      }
    } catch (err) {
      console.error("Failed to load patient timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  const toggleEventExpand = (eventId) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Group events by time-slice
  const filteredEvents = useMemo(() => {
    if (!timelineData?.timeline) return [];

    return timelineData.timeline.filter((ev) => {
      // Category filter
      if (selectedCategory !== "ALL" && ev.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = ev.title?.toLowerCase().includes(query);
        const matchesSummary = ev.summary?.toLowerCase().includes(query);
        const matchesDoc = ev.doctorName?.toLowerCase().includes(query);
        const matchesDept = ev.department?.toLowerCase().includes(query);
        return matchesTitle || matchesSummary || matchesDoc || matchesDept;
      }
      return true;
    });
  }, [timelineData, selectedCategory, searchQuery]);

  // Group events by human-friendly dates
  const groupedTimeline = useMemo(() => {
    const groups = {};
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    for (const ev of filteredEvents) {
      const evDate = new Date(ev.timestamp);
      const evDateStr = evDate.toDateString();

      let groupKey = evDate.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (evDateStr === todayStr) {
        groupKey = "Today";
      } else if (evDateStr === yesterdayStr) {
        groupKey = "Yesterday";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(ev);
    }

    return groups;
  }, [filteredEvents]);

  const getCategoryIcon = (category) => {
    const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.ALL;
    const IconComponent = cfg.icon;
    return <IconComponent className={`w-4 h-4 ${cfg.color}`} />;
  };

  const getBadgeClass = (variant) => {
    switch (variant) {
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "rose":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
      case "purple":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400";
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
      case "indigo":
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dossier Longitudinal Analytics Summary Bar */}
      {timelineData?.analytics && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Longitudinal Medical Dossier
                </span>
                {timelineData.analytics.hasActivePanicAlerts && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                    Active Panic Alert
                  </span>
                )}
                {timelineData.analytics.isCurrentlyAdmitted && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Currently Inpatient
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Patient Medical History Timeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidated chronological view spanning {timelineData.analytics.totalEvents} recorded events across OPD, IPD, Diagnostics, Surgeries, and Nursing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTimeline}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Dossier
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Events
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {timelineData.analytics.totalEvents}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Inpatient Stays
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {timelineData.analytics.totalAdmissions}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Consultations
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {timelineData.analytics.totalEncounters}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Prescriptions
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {timelineData.analytics.totalPrescriptions}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Lab Diagnostic Orders
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {timelineData.analytics.totalLabOrders}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                SOAP Rounds
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {timelineData.analytics.totalSoapRounds}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Filters & Search Control Bar */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline by clinical keyword, doctor, medication, or diagnosis..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : cfg.color}`} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Visual Vertical Timeline */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-xs font-medium">Loading longitudinal medical dossier...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No events found in this category
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try switching to "All Events" or clearing your search keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-8 relative">
          {/* Timeline continuous vertical guideline */}
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700 pointer-events-none" />

          {Object.entries(groupedTimeline).map(([groupDate, events]) => (
            <div key={groupDate} className="space-y-4 relative">
              {/* Date Group Badge */}
              <div className="sticky top-2 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-md">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>{groupDate}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({events.length} event{events.length === 1 ? "" : "s"})
                </span>
              </div>

              {/* Events in this Date Group */}
              <div className="space-y-3.5 pt-1">
                {events.map((ev) => {
                  const isExpanded = !!expandedEvents[ev.id];
                  const timeFormatted = new Date(ev.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={ev.id}
                      className={`relative pl-10 transition-all ${
                        ev.isCritical ? "scale-[1.01]" : ""
                      }`}
                    >
                      {/* Timeline Node Circle */}
                      <div
                        className={`absolute left-2.5 top-3.5 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-xs z-10 ${
                          ev.isCritical
                            ? "bg-rose-50 border-rose-500 animate-pulse text-rose-600"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {getCategoryIcon(ev.category)}
                      </div>

                      {/* Event Card Container */}
                      <div
                        className={`bg-white dark:bg-slate-800 rounded-xl border p-4 shadow-2xs transition-all hover:shadow-xs ${
                          ev.isCritical
                            ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {/* Event Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeClass(
                                ev.badge?.variant
                              )}`}
                            >
                              {ev.badge?.label}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {ev.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {timeFormatted}
                            </span>
                            <button
                              onClick={() => toggleEventExpand(ev.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  Less <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  Details <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Event Summary */}
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {ev.summary}
                        </p>

                        {/* Attending Doctor / Department Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {ev.doctorName}
                            </span>
                          </div>
                          {ev.department && (
                            <span className="text-[10px] uppercase font-semibold text-slate-400">
                              {ev.department}
                            </span>
                          )}
                        </div>

                        {/* Expandable Clinical Details Drawer */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                            {/* Category-Specific Deep Dive Details */}

                            {/* A. SOAP Rounding Drawer */}
                            {ev.category === "PHYSICIAN_ROUNDING" && ev.details && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                                    Subjective (S):
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {ev.details.soapSubjective || "No complaints reported"}
                                  </p>
                                </div>
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                                    Objective (O):
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {ev.details.soapObjective || "Vitals and exam reviewed"}
                                  </p>
                                </div>
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                                    Assessment (A):
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {ev.details.soapAssessment || "Condition stable"}
                                  </p>
                                </div>
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                                    Plan (P):
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {ev.details.soapPlan || "Continue current medical regimen"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* B. Vitals Details Drawer */}
                            {ev.category === "VITAL_SIGN" && ev.details && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 text-center">
                                  <span className="text-[10px] text-slate-500 uppercase block">
                                    Blood Pressure
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {ev.details.bpSystolic && ev.details.bpDiastolic
                                      ? `${ev.details.bpSystolic}/${ev.details.bpDiastolic} mmHg`
                                      : "--"}
                                  </span>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 text-center">
                                  <span className="text-[10px] text-slate-500 uppercase block">
                                    Heart Rate
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {ev.details.pulse ? `${ev.details.pulse} bpm` : "--"}
                                  </span>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 text-center">
                                  <span className="text-[10px] text-slate-500 uppercase block">
                                    SpO2
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {ev.details.spo2 ? `${ev.details.spo2}%` : "--"}
                                  </span>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 text-center">
                                  <span className="text-[10px] text-slate-500 uppercase block">
                                    Temperature
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {ev.details.temperature ? `${ev.details.temperature}°F` : "--"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* C. Prescription Medications Drawer */}
                            {ev.category === "PRESCRIPTION" && ev.details?.items && (
                              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 text-xs space-y-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  Prescribed Medications:
                                </span>
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                  {ev.details.items.map((med, idx) => (
                                    <li key={idx} className="py-1.5 flex items-center justify-between">
                                      <div>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                          {med.item_name || med.medicine_name}
                                        </span>
                                        <span className="text-[11px] text-slate-500 block">
                                          Dosage: {med.dosage || "As directed"} &bull; Freq: {med.frequency || "Daily"}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-mono text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                        {med.duration_days ? `${med.duration_days} days` : "Standard course"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* D. Lab Results Drawer */}
                            {ev.category === "LAB_RESULT" && ev.details?.items && (
                              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 text-xs space-y-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  Diagnostic Test Items & Status:
                                </span>
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                  {ev.details.items.map((item, idx) => (
                                    <li key={idx} className="py-1.5 flex items-center justify-between">
                                      <div>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                          {item.test?.test_name || item.test_name || "Diagnostic Test"}
                                        </span>
                                        {item.result_value && (
                                          <span className="text-[11px] text-slate-600 block">
                                            Result: <strong className="text-slate-900">{item.result_value}</strong>{" "}
                                            {item.test?.reference_range && `(Ref: ${item.test.reference_range})`}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                        {item.sample_status || item.status || "Ordered"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* E. Panic Alert Critical Drawer */}
                            {ev.category === "PANIC_ALERT" && ev.details && (
                              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  Emergency Laboratory Value Report
                                </div>
                                <p>
                                  Test: <strong>{ev.details.testName}</strong> &bull; Measured: <strong className="text-red-700 dark:text-red-200">{ev.details.resultValue}</strong>
                                </p>
                                <p className="text-[11px]">
                                  Panic Threshold: {ev.details.criticalThresholds}
                                </p>
                                {ev.details.acknowledgedAt && (
                                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                                    Acknowledged on {new Date(ev.details.acknowledgedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* F. Inpatient Admission Drawer */}
                            {ev.category === "ADMISSION" && ev.details && (
                              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                                {ev.details.ward && (
                                  <p>
                                    Ward & Bed: <strong>{ev.details.ward}</strong> &bull; {ev.details.room} &bull; {ev.details.bed}
                                  </p>
                                )}
                                {ev.details.gatePassNumber && (
                                  <p>
                                    Gate Pass: <strong className="font-mono">{ev.details.gatePassNumber}</strong>
                                  </p>
                                )}
                                {ev.details.finalDiagnosis && (
                                  <p>
                                    Discharge Diagnosis: <strong>{ev.details.finalDiagnosis}</strong>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientTimeline;

