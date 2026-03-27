import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search, Scissors } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import surgeriesService from "../../service/surgeriesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";

const STATUS_COLORS = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  postponed: "bg-gray-100 text-gray-600",
};

export default function SurgeriesList() {
  const navigate = useNavigate();
  const [surgeries, setSurgeries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => fetch(1), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { fetch(page); }, [page, status]);

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const res = await surgeriesService.getAll({ page: p, limit, search: search || undefined, status: status || undefined });
      const d = res.data?.data;
      setSurgeries(d?.data || []);
      setTotal(d?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch surgeries");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <Scissors className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Surgeries</h2>
            <p className="text-xs text-gray-500">Schedule and manage surgical procedures</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <Input placeholder="Search surgery no / OT" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 text-sm bg-white" />
          </div>

          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="h-9 text-sm w-[150px] bg-white border border-gray-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 gap-2"
            onClick={() => navigate("/surgeries/create")}>
            <Plus size={14} /> Schedule Surgery
          </Button>
          <Button className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9" onClick={() => fetch(page)}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-[#F6F7FF]">
            <tr>
              {["Surgery No", "Patient", "Procedure", "Scheduled At", "OT", "Anesthesia", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-10 text-center text-gray-400">Loading...</td></tr>
            ) : surgeries.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-gray-400">No surgeries found.</td></tr>
            ) : surgeries.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.surgery_no}</td>
                <td className="px-4 py-3 text-gray-700">
                  {s.patient ? `${s.patient.first_name} ${s.patient.last_name}` : "—"}
                  <div className="text-xs text-gray-400">{s.patient?.patient_code}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{s.procedure?.name || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{dayjs(s.scheduled_at).format("MMM D, YYYY HH:mm")}</td>
                <td className="px-4 py-3 text-gray-700">{s.operation_theater || "—"}</td>
                <td className="px-4 py-3 text-gray-700 capitalize">{s.anesthesia_type || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}>
                    {s.status?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/surgeries/edit/${s.id}`)}
                    className="text-indigo-600 hover:underline text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Showing {surgeries.length} of {total}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"}
              className={page === i + 1 ? "bg-[#506EE4] text-white" : ""}
              onClick={() => setPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
