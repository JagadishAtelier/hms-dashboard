import React, { useRef, useState } from "react";
import { Upload, Trash2, FileText, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import hrmsService from "../../service/hrmsService.js";
import uploadService from "../../service/uploadService.js";
import StaffSelect from "./StaffSelect.jsx";

const DOC_TYPES = ["ID Proof", "Address Proof", "Educational", "Experience", "Contract", "Other"];

const typeColor = (t) => ({
    "ID Proof": "bg-blue-100 text-blue-700",
    "Address Proof": "bg-green-100 text-green-700",
    "Educational": "bg-purple-100 text-purple-700",
    "Experience": "bg-yellow-100 text-yellow-700",
    "Contract": "bg-orange-100 text-orange-700",
    "Other": "bg-gray-100 text-gray-600",
}[t] ?? "bg-gray-100 text-gray-600");

const fileIcon = (name = "") => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    return '📎';
};

export default function StaffDocuments() {
    const [staffId, setStaffId] = useState("");
    const [docs, setDocs] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [docName, setDocName] = useState("");
    const [docType, setDocType] = useState("Other");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleStaffSelect = async (id) => {
        setStaffId(id); setLoaded(false);
        if (!id) return;
        try { const r = await hrmsService.getDocumentsByStaff(id); setDocs(r?.data?.data ?? []); setLoaded(true); }
        catch { toast.error("Failed to load documents"); }
    };

    const reload = async () => {
        if (!staffId) return;
        try { const r = await hrmsService.getDocumentsByStaff(staffId); setDocs(r?.data?.data ?? []); }
        catch {}
    };

    const handleUpload = async () => {
        if (!docName.trim()) { toast.error("Document name is required"); return; }
        if (!selectedFile) { toast.error("Please select a file"); return; }
        setUploading(true);
        try {
            // 1. Upload file to DO Spaces
            const upRes = await uploadService.uploadStaffDocument(selectedFile);
            const { file_url, file_name } = upRes?.data?.data;

            // 2. Save document record
            await hrmsService.uploadDocument({
                staff_profile_id: staffId,
                document_name: docName,
                document_type: docType,
                file_url,
                file_name,
            });

            toast.success("Document uploaded");
            setShowUpload(false);
            setDocName(""); setDocType("Other"); setSelectedFile(null);
            reload();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Upload failed");
        } finally { setUploading(false); }
    };

    const del = async (id) => {
        if (!confirm("Delete this document?")) return;
        try { await hrmsService.deleteDocument(id); toast.success("Deleted"); reload(); }
        catch { toast.error("Failed"); }
    };

    return (
        <div className="p-4 space-y-4">
            <div><h2 className="text-xl font-bold text-gray-800">Staff Documents</h2>
                <p className="text-xs text-gray-500">Upload and manage staff documents</p></div>

            <div>
                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Select Staff</label>
                <StaffSelect value={staffId} onChange={handleStaffSelect} />
            </div>

            {loaded && (
                <>
                    <div className="flex justify-end">
                        <button onClick={() => setShowUpload(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#506EE4] text-white hover:bg-[#3f56c2]">
                            <Upload size={14} /> Upload Document
                        </button>
                    </div>

                    {docs.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                            No documents found for this staff.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {docs.map(d => (
                                <div key={d.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{fileIcon(d.file_name)}</span>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{d.document_name}</p>
                                                <p className="text-xs text-gray-400">{d.file_name}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-600 shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <span className={`self-start px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(d.document_type)}`}>
                                        {d.document_type}
                                    </span>
                                    <p className="text-xs text-gray-400">Uploaded {dayjs(d.createdAt).format("DD MMM YYYY")}</p>
                                    <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-[#506EE4] hover:underline mt-auto">
                                        <Eye size={12} /> View / Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[440px] rounded-xl shadow-xl p-6 relative">
                        <button onClick={() => setShowUpload(false)} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={18} /></button>
                        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
                        <div className="space-y-3 text-sm">
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Document Name *</label>
                                <input value={docName} onChange={e => setDocName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm" placeholder="e.g. Aadhar Card" /></div>
                            <div><label className="text-xs font-medium text-gray-500 uppercase">Document Type</label>
                                <select value={docType} onChange={e => setDocType(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm">
                                    {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select></div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">File *</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#506EE4] hover:bg-blue-50 transition-colors">
                                    {selectedFile ? (
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                            <span className="text-xl">{fileIcon(selectedFile.name)}</span>
                                            <span className="font-medium">{selectedFile.name}</span>
                                            <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <Upload size={20} className="mx-auto mb-1" />
                                            <p className="text-sm">Click to select file</p>
                                            <p className="text-xs mt-0.5">PDF, JPG, PNG, DOC, XLS (max 10MB)</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
                                    onChange={e => setSelectedFile(e.target.files[0] || null)} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowUpload(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleUpload} disabled={uploading}
                                className="flex-1 bg-[#506EE4] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
