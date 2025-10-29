import React from "react";
import { Card, CardContent } from "@/components/ui/card";

function PatientOverviewFields({ patient, history }) {
  const encounter = history?.latestEncounter;
  const diagnosis = history?.latestDiagnosis;
  const admission = history?.latestAdmission;
  const vitals = history?.latestVital;
  const note = history?.latestNote;

  // ✅ Lab Orders from API
  const labOrders = history?.labOrders || [];

  // ✅ Flattened lab test items from all orders
  const labTests = labOrders.flatMap((order) =>
    order.items.map((item) => ({
      orderNo: order.order_no,
      status: order.status,
      priority: order.priority,
      sampleType: item.sample_type,
      result: item.result_value,
      resultUrl: item.result_file_url,
    }))
  );

  const medicines = history?.medications || [];

  return (
    <div className="w-[58%] flex flex-col gap-5">
      {/* HEADER */}
      <h2 className="text-xl font-semibold text-[#0E1680] mb-1">
        Previous Consultation
      </h2>

      {/* DETAILS CARD */}
      <Card className="shadow-sm border rounded-xl">
        <CardContent className="p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="font-medium">
              {`${patient?.first_name || ""} ${patient?.last_name || ""}`}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Reason for Consultation</p>
            <p className="font-medium whitespace-pre-wrap bg-[#F8F9FF] p-3 rounded-md">
              {encounter?.chief_complaint || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Review Notes</p>
            <p className="font-medium whitespace-pre-wrap bg-[#F8F9FF] p-3 rounded-md">
              {note?.note || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Diagnosis & Findings</p>
            <p className="font-medium whitespace-pre-wrap bg-[#F8F9FF] p-3 rounded-md">
              {diagnosis?.description || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Treatment Plan</p>
            <p className="font-medium whitespace-pre-wrap bg-[#F8F9FF] p-3 rounded-md">
              {encounter?.plan || "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TESTS & MEDICINES */}
      <div className="flex justify-between mt-2">
        {/* ✅ LAB TESTS */}
        <div className="w-[48%] bg-white border rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-[#0E1680] mb-3">Lab Tests</h3>
          {labTests.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              {labTests.map((test, idx) => (
                <li key={idx} className="leading-snug">
                  <p>
                    <span className="font-medium">{test.sampleType}</span>{" "}
                    ({test.status})
                  </p>
                  {test.result && (
                    <p className="text-gray-600 text-xs mt-1">
                      Result: {test.result}
                    </p>
                  )}
                  {test.resultUrl && (
                    <a
                      href={test.resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      View Report
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No lab tests available</p>
          )}
        </div>

        {/* ✅ MEDICINES */}
        <div className="w-[48%] bg-white border rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-[#0E1680] mb-3">
            Prescribed Medicines
          </h3>
          {medicines.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
              {medicines.map((m, idx) => (
                <li key={idx}>
                  {m?.medicine_name || "Unnamed Medicine"}{" "}
                  {m?.dosage ? `- ${m.dosage}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No medicines available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientOverviewFields;
