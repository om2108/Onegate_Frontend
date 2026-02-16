import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function SecretaryDashboard() {
  const [attendance, setAttendance] = useState([
    { name: "Ramesh", role: "Watchman", shift: "Day", status: "Present" },
    { name: "Suresh", role: "Cleaner", shift: "Day", status: "Present" },
    { name: "Mahesh", role: "Gardener", shift: "Evening", status: "Present" },
    { name: "Raju", role: "Liftman", shift: "Night", status: "Present" },
  ]);

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "Present").length;
  const absent = total - present;

  const handleAttendanceChange = (index, newStatus) => {
    setAttendance((prev) =>
      prev.map((a, i) => (i === index ? { ...a, status: newStatus } : a))
    );
  };

  const barData = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Maintenance Collected (₹)",
          data: [30000, 40000, 35000, 50000, 45000, 60000],
          backgroundColor: "rgba(99,102,241,0.85)",
          borderRadius: 6,
        },
      ],
    }),
    []
  );

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Monthly Maintenance Collected" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Amount (₹)" },
        ticks: { callback: (v) => "₹" + v / 1000 + "k" },
      },
      x: { title: { display: true, text: "Month" } },
    },
  };

  const pieData = useMemo(
    () => ({
      labels: ["Resolved", "Pending", "In Progress"],
      datasets: [
        {
          label: "Complaint Status",
          data: [45, 25, 30],
          backgroundColor: ["#10b981", "#f97316", "#3b82f6"],
          hoverOffset: 6,
        },
      ],
    }),
    []
  );

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Complaint Status Distribution" },
    },
  };

  return (
    <div className="p-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Staff", value: total, color: "from-indigo-500 to-purple-500" },
          { label: "Present", value: present, color: "from-green-500 to-emerald-400" },
          { label: "Absent", value: absent, color: "from-orange-500 to-amber-400" },
          { label: "Resolved Complaints", value: 45, color: "from-blue-500 to-cyan-400" },
          { label: "Pending Complaints", value: 25, color: "from-pink-500 to-rose-400" },
        ].map((c, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg text-white shadow hover:shadow-md bg-gradient-to-r ${c.color} transition`}
          >
            <p className="text-sm opacity-90">{c.label}</p>
            <p className="text-2xl font-semibold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2 text-gray-700">Maintenance Report</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2 text-gray-700">Complaint Status</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">👷 Staff Attendance</h2>

        <div className="flex flex-col sm:flex-row justify-around mb-4 text-center gap-4">
          <div>
            <h3 className="text-gray-600">Total Staff</h3>
            <p className="font-semibold text-lg">{total}</p>
          </div>
          <div>
            <h3 className="text-gray-600">Present</h3>
            <p className="font-semibold text-green-600 text-lg">{present}</p>
          </div>
          <div>
            <h3 className="text-gray-600">Absent</h3>
            <p className="font-semibold text-red-500 text-lg">{absent}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-indigo-500 text-white">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Shift</th>
                <th className="p-3 text-left">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.role}</td>
                  <td className="p-3">{a.shift}</td>
                  <td className="p-3">
                    <select
                      value={a.status}
                      onChange={(e) => handleAttendanceChange(index, e.target.value)}
                      className="border rounded px-2 py-1 text-sm w-full"
                    >
                      <option value="Present">✅ Present</option>
                      <option value="Absent">❌ Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
