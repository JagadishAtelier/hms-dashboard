import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Edit2, Trash2, RotateCw, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import hrService from "../../service/hrService.js";
import Loading from "../Loading.jsx";

export default function HRList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchData = async (p = 1) => {
        setLoading(true);
        try {
            const res = await hrService.getAll({ page: p, limit });
            const d = res?.data?.data;
            setData(d?.data ?? []);
            setTotal(d?.total ?? 0);
            setPage(p);
        } catch { toast.error("Failed to fetch HR staff"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(1); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this HR staff?")) return;
        try { await hrService.delete(id); toast.success("Deleted"); fetchData(page); }
        catch { toast.error("Delete failed"); }
    };

    const handleRestore = async (id) => {
        try { await hrService.restore(id); toast.success("Restored"); fetchData(page); }
        catch { toast.error("Restore failed"); }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (loading) return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users size={20} className="text-gray-600" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">HR Staff</h2>
                        <p className="text-xs text-gray-500">{total} total HR staff</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchData(page)}><RefreshCw size={14} /></Button>
                    <Button className="bg-[#506EE4] text-white" onClick={() => navigate("/hr/create")}>
                        <Plus size={14} /> Add HR
                    </Button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-auto border rounded-md bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-[#F6F7FF]">
                        <tr>
                            {["Name", "Email", "Phone", "Department", "Designation", "Status", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#475467]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan={7} className="py-10 text-center text-gray-400">No HR staff found.</td></tr>
                        ) : data.map(hr => (
                            <tr key={hr.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{hr.hr_name}</td>
                                <td className="px-4 py-3">{hr.hr_email}</td>
                                <td className="px-4 py-3">{hr.hr_phone || "—"}</td>
                                <td className="px-4 py-3">{hr.staff_profiles?.department?.name || "—"}</td>
                                <td className="px-4 py-3">{hr.staff_profiles?.designation?.title || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${hr.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                        {hr.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <Button size="icon" variant="outline" onClick={() => navigate(`/hr/edit/${hr.id}`)}>
                                        <Edit2 size={14} />
                                    </Button>
                                    {hr.is_active
                                        ? <Button size="icon" variant="outline" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(hr.id)}><Trash2 size={14} /></Button>
                                        : <Button size="icon" onClick={() => handleRestore(hr.id)}><RotateCw size={14} /></Button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <Button size="sm" disabled={page <= 1} onClick={() => fetchData(page - 1)}>Prev</Button>
                    <Button size="sm" disabled={page >= totalPages} onClick={() => fetchData(page + 1)}>Next</Button>
                </div>
            </div>
        </div>
    );
}
