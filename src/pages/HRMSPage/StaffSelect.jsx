import React, { useEffect, useState, useRef } from "react";
import { Search, X, User, Loader2 } from "lucide-react";
import hrmsService from "../../service/hrmsService.js";

export default function StaffSelect({ value, onChange, placeholder = "Search staff by name or code...", className = "" }) {
    const [query, setQuery] = useState("");
    const [allStaff, setAllStaff] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const ref = useRef(null);

    // Load all staff once
    useEffect(() => {
        setLoadingStaff(true);
        hrmsService.getAllStaffProfiles({ limit: 500 })
            .then(res => {
                // Handle both wrapped (sendSuccess) and unwrapped responses
                const raw = res?.data;
                let list = [];
                if (Array.isArray(raw)) list = raw;
                else if (Array.isArray(raw?.data)) list = raw.data;
                else if (Array.isArray(raw?.data?.data)) list = raw.data.data;
                else if (raw?.data?.data?.data) list = raw.data.data.data;
                setAllStaff(list);
            })
            .catch(() => {})
            .finally(() => setLoadingStaff(false));
    }, []);

    // Filter on query change
    useEffect(() => {
        if (!query.trim()) { setFiltered(allStaff.slice(0, 15)); return; }
        const q = query.toLowerCase();
        setFiltered(
            allStaff.filter(s =>
                `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase().includes(q) ||
                (s.employee_code || "").toLowerCase().includes(q)
            ).slice(0, 15)
        );
    }, [query, allStaff]);

    // Sync external value
    useEffect(() => {
        if (value && allStaff.length > 0 && !selected) {
            const found = allStaff.find(s => s.id === value);
            if (found) { setSelected(found); setQuery(`${found.first_name} ${found.last_name} (${found.employee_code})`); }
        }
        if (!value) { setSelected(null); setQuery(""); }
    }, [value, allStaff]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const select = (staff) => {
        setSelected(staff);
        setQuery(`${staff.first_name} ${staff.last_name} (${staff.employee_code})`);
        setOpen(false);
        onChange(staff.id, staff);
    };

    const clear = (e) => {
        e.stopPropagation();
        setSelected(null); setQuery(""); setOpen(false);
        onChange("", null);
    };

    return (
        <div className={`relative ${className}`} ref={ref}>
            <div className="relative">
                {loadingStaff
                    ? <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                    : <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                }
                <input
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); if (selected) { setSelected(null); onChange("", null); } }}
                    onFocus={() => { setOpen(true); if (!query) setFiltered(allStaff.slice(0, 15)); }}
                    placeholder={loadingStaff ? "Loading staff..." : placeholder}
                    className="w-full pl-8 pr-7 border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#506EE4]/30"
                />
                {(selected || query) && (
                    <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                        <X size={13} />
                    </button>
                )}
            </div>

            {open && (
                <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">
                            {loadingStaff ? "Loading..." : allStaff.length === 0 ? "No staff found" : "No match"}
                        </p>
                    ) : filtered.map(s => (
                        <button key={s.id} onClick={() => select(s)}
                            className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#506EE4]/10 flex items-center justify-center shrink-0">
                                <User size={13} className="text-[#506EE4]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{s.first_name} {s.last_name}</p>
                                <p className="text-xs text-gray-400">{s.employee_code}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
