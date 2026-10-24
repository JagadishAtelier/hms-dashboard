import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  IndianRupee,
  Bed,
  CalendarCheck,
  FlaskConical,
  Package,
  RefreshCw,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import Loading from "@/pages/Loading";
import analyticsService from "@/service/analyticsService";
import DateRangeSelector from "./components/DateRangeSelector";
import ExecutiveTab from "./components/ExecutiveTab";
import FinancialsTab from "./components/FinancialsTab";
import InpatientTab from "./components/InpatientTab";
import OpdTab from "./components/OpdTab";
import LaboratoryTab from "./components/LaboratoryTab";
import PharmacyTab from "./components/PharmacyTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "executive", label: "Executive Overview", icon: LayoutDashboard },
  { id: "financials", label: "Financials & Margins", icon: IndianRupee },
  { id: "inpatient", label: "Inpatient & Beds", icon: Bed },
  { id: "opd", label: "Clinical & OPD", icon: CalendarCheck },
  { id: "laboratory", label: "Laboratory", icon: FlaskConical },
  { id: "pharmacy", label: "Pharmacy & Stock", icon: Package },
];

export default function AnalyticsHub() {
  const [activeTab, setActiveTab] = useState("executive");
  const [dateRange, setDateRange] = useState({
    period: "this_month",
    startDate: undefined,
    endDate: undefined,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab data caches
  const [summaryData, setSummaryData] = useState(null);
  const [financialsData, setFinancialsData] = useState(null);
  const [inpatientData, setInpatientData] = useState(null);
  const [opdData, setOpdData] = useState(null);
  const [labData, setLabData] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        period: dateRange.period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      if (activeTab === "executive") {
        const res = await analyticsService.getSummary(params);
        setSummaryData(res?.data || res);
      } else if (activeTab === "financials") {
        const res = await analyticsService.getFinancials(params);
        setFinancialsData(res?.data || res);
      } else if (activeTab === "inpatient") {
        const res = await analyticsService.getInpatient(params);
        setInpatientData(res?.data || res);
      } else if (activeTab === "opd") {
        const res = await analyticsService.getOpd(params);
        setOpdData(res?.data || res);
      } else if (activeTab === "laboratory") {
        const res = await analyticsService.getLaboratory(params);
        setLabData(res?.data || res);
      } else if (activeTab === "pharmacy") {
        const res = await analyticsService.getPharmacy(params);
        setPharmacyData(res?.data || res);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load analytics";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, dateRange]);

  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Atelier HMS Healthcare Intelligence Export\r\n";
      csvContent += `Generated At,${new Date().toISOString()}\r\n`;
      csvContent += `Active Tab,${activeTab}\r\n`;
      csvContent += `Period,${dateRange.period}\r\n\r\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hms_analytics_${activeTab}_${dateRange.period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Analytics CSV exported successfully");
    } catch {
      toast.error("Failed to generate CSV export");
    }
  };

  return (
    <div className="p-4 md:p-0 space-y-6 max-w-7xl mx-auto pb-28 md:pb-8">
      {/* 1. PAGE HEADER & DATE FILTER BAR */}
      <PageHeader
        title="Healthcare Intelligence Hub"
        description="Real-time clinical service delivery, capacity utilization & financial performance analytics."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Analytics" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeSelector
              period={dateRange.period}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(newRange) => setDateRange(newRange)}
              disabled={loading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="gap-1.5 h-9"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 h-9"
              title="Export Analytics CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        }
      />

      {/* 2. RESPONSIVE TABBED NAVIGATION BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200/80 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none",
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            className="text-xs h-7 border-rose-300 text-rose-700 bg-white"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4. ACTIVE TAB CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Loading />
        </div>
      ) : (
        <div>
          {activeTab === "executive" && (
            <ExecutiveTab
              data={summaryData}
              onSelectTab={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === "financials" && (
            <FinancialsTab
              data={financialsData || summaryData?.breakdowns?.financials}
            />
          )}

          {activeTab === "inpatient" && (
            <InpatientTab
              data={inpatientData || summaryData?.breakdowns?.inpatient}
            />
          )}

          {activeTab === "opd" && (
            <OpdTab
              data={opdData || summaryData?.breakdowns?.opd}
            />
          )}

          {activeTab === "laboratory" && (
            <LaboratoryTab
              data={labData || summaryData?.breakdowns?.laboratory}
            />
          )}

          {activeTab === "pharmacy" && (
            <PharmacyTab
              data={pharmacyData || summaryData?.breakdowns?.pharmacy}
            />
          )}
        </div>
      )}
    </div>
  );
}
