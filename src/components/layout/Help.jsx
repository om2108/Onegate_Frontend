// src/pages/Help.jsx
import React from "react";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default function Help() {
  return (
    <section className="max-w-4xl mx-auto py-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <QuestionMarkCircleIcon className="h-7 w-7 text-blue-600" />
          Help & Support
        </h1>
        <p className="mt-1 text-gray-600 text-sm sm:text-base">
          Find answers to common questions or learn how to use OneGate dashboard.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Getting started */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpenIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Getting Started
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• How to log in and access your dashboard</li>
            <li>• Understanding your role (Owner / Tenant / Secretary / Watchman)</li>
            <li>• Navigating the sidebar modules</li>
          </ul>
        </div>

        {/* Appointments & Properties */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Appointments & Properties
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• How tenants can request property visits</li>
            <li>• How owners approve / reject appointments</li>
            <li>• Viewing approved visits in your dashboard</li>
          </ul>
        </div>

        {/* FAQ quick list */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">
                Q. I can’t log in. What should I do?
              </p>
              <p>A. Make sure your email is verified and your password is correct. If the issue continues, contact your society admin.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Q. I don’t see my property in the list.
              </p>
              <p>
                A. Ask the owner or secretary to add the property, or check if you are logged in with the correct account.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Q. How do I change my profile information?
              </p>
              <p>
                A. Open the profile dropdown in the header and click{" "}
                <span className="font-semibold">“View / Edit Profile”</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
