import React from "react";
import {
  Home,
  UserPlus,
  BookOpen,
  Award,
  Bell,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import ucscLogo from "@/assets/ucsc_logo.png";

function Sidebar() {
  const mainLinks = [
    { name: "Home", path: "/portal", icon: Home },
    { name: "Register", path: "/portal/register", icon: UserPlus },
    { name: "My Exams", path: "/portal/my-exams", icon: BookOpen },
    { name: "My Results", path: "/portal/my-results", icon: Award },
    { name: "Notifications", path: "/portal/notifications", icon: Bell },
  ];

  const logoutLink = { name: "Log out", path: "/portal/logout", icon: LogOut };

  return (
    <div
      className={`
    h-screen bg-white p-4
    w-20 md:w-64
    flex flex-col justify-between
    transition-all duration-300 ease-in-out
    shadow-lg shadow-blue-200
    rounded-tr-2xl rounded-br-2xl
  `}
    >

      {/* Top + Main Nav Section */}
      <div>
        {/* UCSC Logo */}
        <div className="hidden md:flex items-center justify-center mb-4">
          <img src={ucscLogo} alt="UCSC Logo" className="h-16" draggable={false} />
        </div>

        {/* UCSC Text */}
        <div className="hidden md:block text-center mb-12 text-lg font-semibold text-blue-900 select-none">
          UCSC-
          <br/>University Gateway Solutions
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-5">
          {mainLinks.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              end={name === "Home"} // Add end prop only for Home link
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform ${isActive
                  ? "bg-blue-100 text-blue-900 font-bold border-l-4 border-blue-700 scale-105"
                  : "text-blue-900 hover:bg-blue-50 hover:scale-105"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="hidden md:inline transition-all duration-300">
                {name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Logout link at bottom */}
      <div className="mt-6">
        <NavLink
          to={logoutLink.path}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform ${isActive
              ? "bg-red-100 text-red-600 font-bold border-l-4 border-red-600 scale-105"
              : "text-red-600 hover:bg-red-50 hover:scale-105"
            }`
          }
        >
          <LogOut className="h-5 w-5 text-red-600" />
          <span className="hidden md:inline transition-all duration-300">
            {logoutLink.name}
          </span>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;