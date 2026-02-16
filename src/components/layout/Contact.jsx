import React, { useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted successfully (demo)");
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="max-w-4xl mx-auto py-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <EnvelopeIcon className="h-7 w-7 text-blue-600" />
          Contact Support
        </h1>
        <p className="mt-1 text-gray-600 text-sm sm:text-base">
          Have an issue or suggestion? Send us a message and we’ll reach out.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1.3fr]">
        {/* Contact form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          {submitted && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              ✅ Your message has been recorded (demo). You can wire this to a
              real API later.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Issue with login, Appointment not showing, etc."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Describe the problem or feedback in detail..."
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Static contact details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            Contact Details
          </h2>

          <div className="flex items-start gap-3 text-sm text-gray-700">
            <PhoneIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Support Phone</p>
              <p>+91-98765-12345</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm text-gray-700">
            <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Support Email</p>
              <p>support@onegate.app</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm text-gray-700">
            <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Office</p>
              <p>
                OneGate Society Management
                <br />
                Pune, Maharashtra
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-2">
            For urgent issues related to security or gate access, please also
            contact your society secretary directly.
          </p>
        </div>
      </div>
    </section>
  );
}
