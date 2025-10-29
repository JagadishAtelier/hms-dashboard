// src/pages/lab/LabTestResults.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import labTestOrderService from "../../service/labtestorderService.js";

function LabTestResults() {
  const { encounter_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [resultValue, setResultValue] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("user"));
  const userRole = userInfo?.role;

  useEffect(() => {
    if (encounter_id) fetchLabTestOrder(encounter_id);
  }, [encounter_id]);

  const fetchLabTestOrder = async (encId) => {
    try {
      setLoading(true);
      const res = await labTestOrderService.getLabTestOrderByEncounterId(encId);
      setOrder(res?.data);
    } catch (err) {
      console.error("Failed to fetch lab test results", err);
      toast.error(err?.response?.data?.message || "Failed to load lab test results");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResult = (item) => {
    setSelectedItem(item);
    setResultValue(item?.result_value || "");
    setResultFileUrl(item?.result_file_url || "");
    setShowModal(true);
  };

  const handleSubmitResult = async () => {
    if (!resultValue.trim()) {
      toast.error("Please enter a result value");
      return;
    }

    try {
      const res = await labTestOrderService.markLabTestItemResulted(selectedItem.id, {
        result_value: resultValue,
        result_file_url: resultFileUrl,
      });
      toast.success(res?.message || "Result updated successfully");
      setShowModal(false);
      fetchLabTestOrder(encounter_id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update result");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-[#0E1680]" size={40} />
      </div>
    );

  if (!order)
    return (
      <div className="p-6 text-center text-gray-600">
        No lab test order found for this encounter.
      </div>
    );

  const { patient, encounter, items } = order;

  return (
    <div className="p-8 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0E1680] flex items-center gap-2">
          <FileText size={24} /> Lab Test Results
        </h2>
      </div>

      {/* Patient Info */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-4 text-sm text-gray-800">
          <div>
            <h3 className="font-semibold text-[#0E1680] mb-2">Patient Details</h3>
            <p><span className="font-medium">Name:</span> {patient?.first_name} {patient?.last_name}</p>
            <p><span className="font-medium">Patient Code:</span> {patient?.patient_code}</p>
            <p><span className="font-medium">Gender / Age:</span> {patient?.gender}, {patient?.age} yrs</p>
            <p><span className="font-medium">Phone:</span> {patient?.phone}</p>
          </div>

          <div>
            <h3 className="font-semibold text-[#0E1680] mb-2">Encounter Info</h3>
            <p><span className="font-medium">Encounter No:</span> {encounter?.encounter_no}</p>
            <p><span className="font-medium">Date:</span> {new Date(encounter?.encounter_date).toLocaleDateString()}</p>
            <p><span className="font-medium">Doctor:</span> {encounter?.created_by_name || "-"}</p>
            <p><span className="font-medium">Status:</span> {encounter?.status || "N/A"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-[#0E1680] mb-2">Order Info</h3>
            <p><span className="font-medium">Order No:</span> {order?.order_no}</p>
            <p><span className="font-medium">Priority:</span> {order?.priority?.toUpperCase()}</p>
            <p><span className="font-medium">Status:</span> {order?.status?.toUpperCase()}</p>
            <p><span className="font-medium">Ordered On:</span> {new Date(order?.order_date).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-[#0E1680] mb-4">Test Details</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-[#0E1680] text-white">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Test Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Sample Type</th>
                  <th className="p-3 text-left">Result Value</th>
                  <th className="p-3 text-left">Units</th>
                  <th className="p-3 text-left">Reference Range</th>
                  <th className="p-3 text-left">Result File</th>
                  {userRole === "Lab Technician" && (
                    <th className="p-3 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items?.map((it, idx) => (
                  <tr key={it.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">{it?.test?.name}</td>
                    <td className="p-3">{it?.test?.category}</td>
                    <td className="p-3">{it?.sample_type}</td>
                    <td className="p-3">
                      {it?.result_value ? (
                        <span className="font-medium text-green-700">{it.result_value}</span>
                      ) : (
                        <span className="italic text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="p-3">{it?.test?.units}</td>
                    <td className="p-3">{it?.test?.reference_range}</td>
                    <td className="p-3">
                      {it?.result_file_url ? (
                        <a
                          href={it.result_file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    {userRole === "Lab Technician" && (
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#0E1680] border-[#0E1680]"
                          onClick={() => handleAddResult(it)}
                        >
                          Add Result
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Add Result */}
      {showModal && (
        <div className="fixed h-[100%] inset-0 bg-[#000000a1] bg-opacity-100 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#0E1680] mb-2">
              Add Result – {selectedItem?.test?.name}
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Result Value</label>
              <input
                type="text"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#0E1680]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Result File URL</label>
              <input
                type="text"
                value={resultFileUrl}
                onChange={(e) => setResultFileUrl(e.target.value)}
                placeholder="Enter file URL"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#0E1680]"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitResult} className="bg-[#0E1680] text-white">
                <Upload size={16} className="mr-1" /> Submit
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-8">
        <p>
          Generated on{" "}
          {new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>Atelier HMS</p>
      </div>
    </div>
  );
}

export default LabTestResults;
