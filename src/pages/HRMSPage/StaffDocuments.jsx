import React, { useState } from "react";
import { Upload, Trash2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import hrmsService from "../../service/hrmsService.js";
import StaffSelect from "./StaffSelect.jsx";

const DOC_TYPES = ["ID Proof", "Address Proof", "Educational", "Experience", "Contract", "Other"];

export default function StaffDocuments() {
    const [staffId, setStaffId] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [docs, setDocs] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [form, setForm] = useState({ document_name: "", document_type: "Other", file_url: "", file_name: "" });
    const [saving, setSaving] = useState(false);

    const handleStaffSelect = async (id, staff) => {
        setStaffId(id); setSelectedStaff(staff); setLoaded(false);
        if (!id) return;
        try { const r = await hrmsService.getDocumentsByStaff(id); setDocs(r?.data?.data ?? []); setLoaded(true); }
        catch { toast.error("Failed to load documents"); }
    };

    const upload = async () => {
        if (!form.document_name || !form.file_url) { toast.error("Name and file URL required"); return; }
        setSaving(true);
        try {
            await hrmsService.uploadDocument({ ...form, staff_profile_id: staffId });
            toast.success("Document uploaded"); setShowUpload(false); setForm({ document_name: "", document_type: "Other", file_url: "", file_name: "" }); load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        finally { setSaving(false); }
    };

    const del = async (id) => {
        if (!confirm("Delete this document?")) return;
        try { await hrmsService.deleteDocument(id); toast.success("Deleted"); load(); }
        catch { toast.error("Failed"); }
    };

    const typeColor = (t) => ({
        "ID Proof": "bg-blue-100 text-blue-700",
        "Address Proof": "bg-green-100 text-green-700",
        "Educational": "bg-purple-100 text-purple-700",
        "Experience": "bg-yellow-100 text-yellow-700",
        "Contract": "bg-orange-100 text-orange-700",
        "Other": "bg-gray-100 text-gray-600",
    }[t] ?? "bg-gray-100 text-gray-600");

    return (
        <div className="p-4 space-y-4">
            <div><h2 className="text-xl font-bold text-gray-800">Staff Documents</h2>
                <p className="text-xs text-gray-500">Upload and manage staff documents</p></div>

            <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Select Staff *</label>
                <StaffSelect value={staffId} onChange={handleStaffSelect} />
            </div>

            {loaded && (
                <>
                    <div className="flex justify-end">
                        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                            <Upload size={14} /> Upload Document
                        </button>
                    </div>

                    {docs.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No documents found for this staff.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {docs.map(d => (
                                <div key={d.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-100 rounded-lg"><FileText size={18} className="text-gray-600" /></div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{d.document_name}</p>
                                                <p className="text-xs text-gray-400">{d.file_name || "—"}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </div>
                                    <span className={`self-start px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(d.document_type)}`}>{d.document_type}</span>
                                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#506EE4] hover:underline truncate">{d.file_url}</a>
                                    <p className="text-xs text-gray-400">Uploaded {dayjs(d.createdAt).format("DD MMM YYYY")}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {showUpload && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[440px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowUpload(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
                        <div className="space-y-3 text-sm">
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Document Name *</label>
                                <input value={form.document_name} onChange={e => setForm(f => ({ ...f, document_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Document Type</label>
                                <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select></div>
                            <div><label className="text-xs font-medium text-gray-500 uppercase">File URL *</label>
                                <input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                            <div><label className="text-xs font-medium text-gray-500 uppercase">File Name</label>
                                <input value={form.file_name} onChange={e => setForm(f => ({ ...f, file_name: e.target.value }))} placeholder="e.g. aadhar.pdf" className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" /></div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowUpload(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={upload} disabled={saving} className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">{saving ? "Uploading..." : "Upload"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
