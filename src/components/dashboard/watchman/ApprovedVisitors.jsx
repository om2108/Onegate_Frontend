import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import { getVisitors, deleteVisitor } from "../../../api/visitor";

const ApprovedItem = ({ item, onCheckout }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-green-200 transition">
      <div className="flex-1">
        <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">
          Visitor
        </div>
        <div className="text-lg font-bold text-gray-800">
          {item.visitorName}
        </div>
      </div>

      <div className="flex flex-col items-start sm:items-end">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle size={12} /> Approved
        </span>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">

        <button
          onClick={() => alert(`Viewing details for ${item.visitorName}`)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          <ExternalLink size={14} /> Details
        </button>

        <button
          onClick={() => onCheckout(item.id)}
          className="flex-1 sm:flex-none bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
        >
          Check Out
        </button>

      </div>
    </div>
  );
};

const ApprovedVisitors = () => {
  const navigate = useNavigate();

  const [approvedList, setApprovedList] = useState([]);

  const societyId = "SOC001";

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    const data = await getVisitors(societyId);
    setApprovedList(data.filter(v => v.status === "APPROVED"));
  };

  const handleCheckout = async (id) => {
    await deleteVisitor(id);
    loadVisitors();
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 py-6 flex justify-center">
      <div className="w-full max-w-4xl">

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/watchman/image-verification")}
            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 bg-white shadow-sm border border-gray-100"
          >
            <ArrowLeft size={24} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">Approved Visitors</h1>
            <p className="text-gray-500 text-sm">
              Visitors currently inside the premises
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">

          {approvedList.length > 0 ? (
            approvedList.map(item => (
              <ApprovedItem
                key={item.id}
                item={item}
                onCheckout={handleCheckout}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">No approved visitors found.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ApprovedVisitors;
