import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import surgeriesService from "../../service/surgeriesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProceduresList() {
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => fetch(1), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { fetch(page); }, [page]);

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const res = await surgeriesService.getAllProcedures({ page: p, limit, search: search || undefined });
      const d = res.data?.data;
      setProcedures(d?.data || []);
      setTotal(d?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch procedures");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-sm flex items-center justify-center border border-gray-200">
            <ClipboardList className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Procedures</h2>
            <p className="text-xs text-gray-500">Manage surgical procedure master data</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <Input placeholder="Search name or code" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 text-sm bg-white" />
          </div>
          <Button className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9 gap-2"
            onClick={() => navigate("/procedures/create")}>
            <Plus size={14} /> Add Procedure
          </Button>
          <Button className="bg-[#506EE4] hover:bg-[#3f56c2] text-white h-9" onClick={() => fetch(page)}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-[#F6F7FF]">
            <tr>
              {["Code", "Name", "Description", "Risk Level", "Base Charge", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[13px] font-semibold text-[#475467]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>
            ) : procedures.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">No procedures found.</td></tr>
            ) : procedures.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.procedure_code}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{p.description || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{p.risk_level || "—"}</td>
                <td className="px-4 py-3 text-gray-700">Rs. {Number(p.base_charge || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/procedures/edit/${p.id}`)}
                    className="text-indigo-600 hover:text-indigo-800">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Showing {procedures.length} of {total}</span>
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
