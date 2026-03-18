import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Settings, LayoutTemplate, ArrowLeft, Search } from "lucide-react";
import RecordsList from "./RecordsList";
import RecordTypes from "./RecordTypes";
import RecordTemplates from "./RecordTemplates";
import CreateRecordTypeModal from "./CreateRecordTypeModal";
import recordsService from "../../service/recordsService";

const Records = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // 'list' | 'types' | 'templates'
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState(null);

  const fetchAll = async () => {
    try {
      const [rRes, tRes, tmRes] = await Promise.all([
        recordsService.getAllRecords(),
        recordsService.getAllRecordTypes(),
        recordsService.getAllTemplates(),
      ]);
      setRecords(rRes.data?.data?.data || rRes.data?.data || []);
      setRecordTypes(tRes.data?.data?.data || tRes.data?.data || []);
      setTemplates(tmRes.data?.data?.data || tmRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch records data", err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const viewTitles = { list: "Medical Records", types: "Record Types", templates: "Record Templates" };
  const viewDescs = {
    list: "Manage and track all medical records",
    types: "Manage different types of medical records",
    templates: "Manage templates for medical records",
  };

  const handleCreate = () => {
    if (view === "templates") navigate("/records/template/create");
    else if (view === "types") { setTypeToEdit(null); setTypeModalOpen(true); }
    else navigate("/records/create");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{viewTitles[view]}</h1>
          <p className="text-sm text-gray-500">{viewDescs[view]}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="h-9 w-full sm:w-[280px] pl-9 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
            <Plus className="h-4 w-4" /> Create New
          </button>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2 justify-end">
        {view === "list" ? (
          <>
            <button onClick={() => setView("types")} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
              <Settings className="h-4 w-4" /> Record Types
            </button>
            <button onClick={() => setView("templates")} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
              <LayoutTemplate className="h-4 w-4" /> Templates
            </button>
          </>
        ) : (
          <button onClick={() => setView("list")} className="flex items-center gap-2 h-9 px-4 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" /> Back to Records
          </button>
        )}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {view === "list" && <RecordsList records={records} searchTerm={search} refreshRecords={fetchAll} />}
        {view === "types" && (
          <RecordTypes types={recordTypes} searchTerm={search} refreshTypes={fetchAll}
            onEdit={(t) => { setTypeToEdit(t); setTypeModalOpen(true); }} />
        )}
        {view === "templates" && <RecordTemplates templates={templates} searchTerm={search} refreshTemplates={fetchAll} />}
      </div>

      <CreateRecordTypeModal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        onRefresh={fetchAll}
        typeToEdit={typeToEdit}
      />
    </div>
  );
};

export default Records;
