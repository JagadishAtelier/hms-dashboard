import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function AdmittedPatientsChart({ admitted_day_wise = [] }) {
  const labels = admitted_day_wise.map((d) =>
    new Date(d.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Admitted Patients",
        data: admitted_day_wise.map((d) => d.count),
        borderColor: "rgba(79,70,229,0.85)",
        backgroundColor: "rgba(79,70,229,0.25)",
        fill: true,
        tension: 0.5,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          color: "#4B5563",
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6B7280", font: { size: 11 } },
      },
      y: {
        grid: { color: "#F3F4F6" },
        ticks: { color: "#6B7280", stepSize: 10 },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Admitted Patients Trend
        </h3>
      </div>

      <Line data={data} options={options} height={100} />
    </div>
  );
}
