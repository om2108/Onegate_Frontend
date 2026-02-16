import React, { useState } from "react";
import { User, Phone, MapPin, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VisitorEntry = () => {
  const [visitorData, setVisitorData] = useState({
    name: "",
    contactNumber: "",
    purpose: "",
    vehicleNumber: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisitorData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(
      `Entry recorded for ${visitorData.name} (Contact: ${visitorData.contactNumber})!`,
    );

    setVisitorData({
      name: "",
      contactNumber: "",
      purpose: "",
      vehicleNumber: "",
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 sm:px-6 py-6 flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-sky-600">Visitor Entry Log</h2>
          <p className="text-gray-500 text-sm">
            Record new visitor information quickly and efficiently.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/watchman/resident-verification")}
          className="mt-3 sm:mt-0 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 hover:border-sky-500 transition"
        >
          Go to Resident Verification
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-md border border-indigo-50 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          Visitor Information
        </h3>
        <p className="text-gray-400 text-sm mb-5">
          Enter the details of the visitor below. All fields are required unless
          marked optional.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Visitor Name */}
          <div className="flex flex-col">
            <label className="flex items-center font-medium text-gray-700 mb-2">
              <User className="text-sky-600 mr-2" size={18} /> Visitor Name
            </label>
            <input
              type="text"
              name="name"
              value={visitorData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          {/* Contact Number */}
          <div className="flex flex-col">
            <label className="flex items-center font-medium text-gray-700 mb-2">
              <Phone className="text-sky-600 mr-2" size={18} /> Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={visitorData.contactNumber}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          {/* Purpose of Visit */}
          <div className="flex flex-col">
            <label className="flex items-center font-medium text-gray-700 mb-2">
              <MapPin className="text-sky-600 mr-2" size={18} /> Purpose of
              Visit
            </label>
            <input
              type="text"
              name="purpose"
              value={visitorData.purpose}
              onChange={handleChange}
              placeholder="Meeting Flat 401 Resident"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          {/* Vehicle Number */}
          <div className="flex flex-col">
            <label className="flex items-center font-medium text-gray-700 mb-2">
              <Car className="text-sky-600 mr-2" size={18} /> Vehicle Details
              (Optional)
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={visitorData.vehicleNumber}
              onChange={handleChange}
              placeholder="MH 01 AB 1234 (Optional)"
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Submit Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorEntry;
