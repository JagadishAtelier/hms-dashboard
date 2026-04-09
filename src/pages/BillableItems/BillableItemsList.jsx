import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import billableItemService from "../../service/billableItemService.js";
import Loading from "../Loading.jsx";

const typeColor = (type) => ({
    Service: "bg-blue-100 text-blue-700",
    Product: "bg-green-100 text-green-700",
    Medication: "bg-purple-100 text-purple-700",
}[type] ?? "bg-gray-100 text-gray-600");

export default function BillableItemsList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [page, setPage] = useState(1);
    const limit = 15;

    const fetchItems = async (p = 1) => {
        setLoading(true);
        try {
            const res = await billableItemService.getAll({ page: p, limit, search, type: typeFilter || undefined });
            const d = res?.data?.data;
            setItems(d?.data ?? []);
            setTotal(d?.total ?? 0);
            setPage(p);
        } catch { toast.error("Failed to load billable items"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(1); }, [search, typeFilter]);

    const handleDelete = async (id) => {
        if (!confirm("Delete this item?")) return;
        try { await billableItemService.delete(id); toast.success("Deleted"); fetchItems(page); }
        catch { toast.error("Delete failed"); }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (loading) return <div className="flex justify-center items-center h-[80vh]"><Loading /></div>;

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Billable Items</h2>
                    <p className="text-xs text-gray-500">{total} items — services, products & medications</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30" />
                    </div>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white">
                        <option value="">All Types</option>
                        <option value="Service">Service</option>
                        <option value="Product">Product</option>
                        <option value="Medication">Medication</option>
                    </select>
                    <button onClick={() => fetchItems(page)}   className="p-2 rounded-md bg-red-500 hover:bg-red-600 text-white border-none flex items-center justify-center"
><RefreshCw size={14} /></button>
                    <button onClick={() => navigate("/billable-items/create")}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                        <Plus size={14} /> Add Item
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Name", "SKU", "Type", "Price", "Cost", "Stock", "Status", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={8} className="py-10 text-center text-gray-400">No items found.</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.sku}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(item.type)}`}>{item.type}</span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800">₹{parseFloat(item.price).toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-500">₹{parseFloat(item.cost || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-500">{item.stock_tracking ? item.current_stock : "N/A"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <button onClick={() => navigate(`/billable-items/edit/${item.id}`)}
                                        className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-600"><Edit2 size={13} /></button>
                                    <button onClick={() => handleDelete(item.id)}
                                        className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => fetchItems(page - 1)}
                        className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Prev</button>
                    <button disabled={page >= totalPages} onClick={() => fetchItems(page + 1)}
                        className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
}
