// src/components/dashboard/WelcomePage.jsx
import React from "react";
import { Link } from "react-router-dom";

const logo =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076067/encuusttipzand6nseyr.svg";
const bg =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076809/t_dogf8x.jpg";
  

export default function WelcomePage({ siteName = "OneGate" }) {
  return (
    <header
      className="relative min-h-screen w-full bg-center bg-cover flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45 md:bg-black/35 pointer-events-none" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5 px-4">
        {/* CLEAN LOGO BLOCK */}
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/15 backdrop-blur-sm 
                     p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.45)] border border-white/20"
        >
          <img
            src={logo}
            alt={`${siteName} logo`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-xl">
          Welcome to {siteName}
        </h1>

        {/* Subtitle */}
        <p className="text-white/90 text-sm md:text-lg max-w-xl drop-shadow-md leading-relaxed">
          Your complete Society & Real Estate Management Portal
        </p>

        {/* BUTTONS */}
        <nav className="mt-3 flex flex-col sm:flex-row gap-4">
          {/* LOGIN */}
          <Link
            to="/login"
            className="px-8 py-3 rounded-full font-semibold text-white 
                       bg-gradient-to-r from-sky-500 to-blue-600 
                       shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200"
          >
            Login
          </Link>

          {/* CLEAN REGISTER BUTTON */}
          <Link
            to="/register"
            className="px-8 py-3 rounded-full font-semibold text-sky-700 
                       bg-white/30 backdrop-blur-md 
                       border border-white/40 shadow-md 
                       hover:bg-white/40 hover:shadow-lg 
                       transition-all duration-200"
          >
            Register
          </Link>
        </nav>

        {/* Stats */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 text-white/85 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold">99.9%</div>
            <div>Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">120+</div>
            <div>Projects</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">24/7</div>
            <div>Support</div>
          </div>
        </div>
      </div>

      {/* Diamond accent */}
      <div className="absolute right-6 bottom-6 text-white/80 text-2xl select-none">
        ◆
      </div>
    </header>
  );
}
