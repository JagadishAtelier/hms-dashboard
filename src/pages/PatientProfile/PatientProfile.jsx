import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation  } from "react-router-dom";
import PatientOverviewFields from "./PatientOverviewFields";
import patientService from "../../service/patientService.js";

function PatientProfile() {
  const { id } = useParams(); // from route like /patients/:id
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(useLocation().search);
  const appointmentId = query.get("appointmentId");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientRes, historyRes] = await Promise.all([
          patientService.getPatientById(id),
          patientService.getHistory(id),
        ]);

        const rawHistory = historyRes?.data || {};

        // ✅ Helper: Get latest by date
        const getLatest = (arr, dateField = "createdAt") =>
          Array.isArray(arr) && arr.length
            ? [...arr].sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]))[0]
            : null;

        const formattedHistory = {
          latestEncounter: getLatest(rawHistory.encounters, "encounter_date"),
          latestAdmission: getLatest(rawHistory.admissions, "createdAt"),
          latestVital: getLatest(rawHistory.vitals, "createdAt"),
          latestDiagnosis: getLatest(rawHistory.diagnoses, "createdAt"),
          latestAppointment: getLatest(rawHistory.appointments, "createdAt"),
          latestNote: getLatest(rawHistory.clinicalNotes, "createdAt"),
          ...rawHistory,
        };

        setPatient(patientRes?.data || {});
        setHistory(formattedHistory);

        console.log("✅ Latest Patient History:", formattedHistory);
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading patient data...</p>;
  if (!patient) return <p className="text-center mt-10 text-red-500">No patient found.</p>;

  const { first_name, last_name, age, gender, patient_code, phone, dob } = patient;
  const fullName = `${first_name || ""} ${last_name || ""}`.trim();

  const latestVitals = history?.latestVital;

  // ✅ Navigate to Today Consultation page
  const handleTodayConsultation = () => {
    navigate(`/doctor-notes/${appointmentId}`); // <-- Adjust this route as per your project
  };

  return (
    <div className="">
      {/* HEADER */}

      <div className="flex gap-10">
        {/* LEFT CONTENT */}
        <div className="w-[40%]">
          {/* Patient Image Section */}
          <div className="flex w-full items-center border-b pb-3">
            <div className="flex flex-col gap-1 items-center text-center justify-center w-1/2">
              <img src="/profile.png" className="h-20 rounded-full" alt="Profile" />
              <p className="font-bold fs-base">{fullName}</p>
              <p>
                {age} Years, {gender}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full bg-[#F2F3FD] p-3 rounded-md">
              <p className="text-lg font-semibold">Current Status</p>
              <p className="bg-[#CCD0F8] text-[#101828] py-1 px-3 rounded-md">
                Room Number: {history?.latestAdmission?.room?.room_no || "N/A"}
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex flex-col gap-4 border-b py-3 px-2">
            <div className="flex justify-between">
              <div>
                <p className="text-[#667085]">Patient ID</p>
                <p>{patient_code}</p>
              </div>
              <div>
                <p className="text-[#667085]">Phone</p>
                <p>{phone}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-[#667085]">Date of Birth</p>
                <p>{dob ? new Date(dob).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-[#667085]">Disease</p>
                <p>{history?.latestDiagnosis?.description || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Vitals */}
          {latestVitals && (
            <div className="flex flex-col gap-4 border-b py-3 px-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#0E1680]">Vital Signs</h3>
                <p className="text-sm text-gray-500">
                  Recorded on:{" "}
                  {latestVitals.recorded_at
                    ? new Date(latestVitals.recorded_at).toLocaleString()
                    : latestVitals.createdAt
                    ? new Date(latestVitals.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <div className="bg-[#E5E7FB] w-full p-3 rounded-md">
                  <p className="mb-2 font-semibold">Blood Pressure</p>
                  <Progress value={50} className="[&>div]:bg-[#3B44B2]" />
                  <p className="text-end mt-1 text-sm">
                    {latestVitals.blood_pressure || "N/A"}
                  </p>
                </div>
                <div className="bg-[#E5E7FB] w-full p-3 rounded-md">
                  <p className="mb-2 font-semibold">Temperature</p>
                  <Progress value={30} className="[&>div]:bg-[#3B44B2]" />
                  <p className="text-end mt-1 text-sm">
                    {latestVitals.temperature
                      ? `${latestVitals.temperature}°C`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <div className="bg-[#E5E7FB] w-full p-3 rounded-md">
                  <p className="mb-2 font-semibold">Pulse</p>
                  <Progress value={30} className="[&>div]:bg-[#3B44B2]" />
                  <p className="text-end mt-1 text-sm">
                    {latestVitals.pulse ? `${latestVitals.pulse} bpm` : "N/A"}
                  </p>
                </div>
                <div className="bg-[#E5E7FB] w-full p-3 rounded-md">
                  <p className="mb-2 font-semibold">Oxygen Levels</p>
                  <Progress
                    value={latestVitals.spo2}
                    className="[&>div]:bg-[#3B44B2]"
                  />
                  <p className="text-end mt-1 text-sm">
                    {latestVitals.spo2 ? `${latestVitals.spo2}%` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Today Consultation Button */}
          <div className="flex justify-center mt-5">
            <Button
              onClick={handleTodayConsultation}
              className="bg-[#0E1680] hover:bg-[#151EB3] text-white px-6 py-2 rounded-lg shadow-sm"
            >
              Today Consultation
            </Button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <PatientOverviewFields patient={patient} history={history} />
      </div>
    </div>
  );
}

export default PatientProfile;
