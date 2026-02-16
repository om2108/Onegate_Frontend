import React from "react";
import logEntries from "../../data/LogsData.json";

export default function Logs() {
  const getStatusClassName = (status) => {
    switch (status) {
      case "Checked In":
        return "bg-blue-100 text-blue-600";
      case "Verified":
        return "bg-green-100 text-green-600";
      case "Checked Out":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ================= EXPORT CSV ================= */

  const handleExport = () => {
    const headers = ["Date","Time","Type","Name","Contact","Purpose","Status"];

    const rows = logEntries.map(l =>
      [l.date,l.time,l.type,l.name,l.contact,l.purpose,l.status]
    );

    let csv = headers.join(",") + "\n";
    rows.forEach(r => csv += r.join(",") + "\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "watchman_logs.csv";
    a.click();
  };

  /* ================= DOWNLOAD PDF ================= */

  const handleDownload = () => {

    let html = `
      <h2>Watchman Logs</h2>
      <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Date</th><th>Time</th><th>Type</th><th>Name</th>
        <th>Contact</th><th>Purpose</th><th>Status</th>
      </tr>
    `;

    logEntries.forEach(l => {
      html += `
        <tr>
          <td>${l.date}</td>
          <td>${l.time}</td>
          <td>${l.type}</td>
          <td>${l.name}</td>
          <td>${l.contact}</td>
          <td>${l.purpose}</td>
          <td>${l.status}</td>
        </tr>
      `;
    });

    html += "</table>";

    const win = window.open("");
    win.document.write(html);
    win.print();
    win.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">
        Watchman Panel Logs
      </h1>

      {/* Log Controls Card */}
      <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-1 text-gray-800">Log Controls</h2>
        <p className="text-sm text-gray-500 mb-6">
          Filter and manage log entries.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              From Date
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              To Date
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Entry Type
            </label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
              <option>All Types</option>
              <option>Visitor Entry</option>
              <option>Resident Verification</option>
            </select>
          </div>

          <div className="ml-auto flex gap-3">
            <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition"
          >
            Export Report
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
          >
            Download Report
          </button>
          </div>
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-1 text-gray-800">
          Recent Log Entries
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Overview of all recorded activities.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Time</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Contact</th>
                <th className="text-left px-4 py-3 font-semibold">
                  Purpose/Result
                </th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {logEntries.map((log, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-sm">{log.date}</td>
                  <td className="px-4 py-3 text-sm">{log.time}</td>
                  <td className="px-4 py-3 text-sm">{log.type}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {log.name}
                  </td>
                  <td className="px-4 py-3 text-sm">{log.contact}</td>
                  <td className="px-4 py-3 text-sm">{log.purpose}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClassName(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
