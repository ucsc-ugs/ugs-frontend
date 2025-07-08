// src/components/ui/OrgAdminSidebar.tsx
import {
  Home,
  Users,
  BookOpen,
  BookPlus,
  School,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import ucscLogo from "@/assets/ucsc_logo.png";
import profileSample from "@/assets/profile_sample.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockAdmin = {
  name: "Admin User",
  role: "University Admin",
  avatar: profileSample,
  university: "University of Colombo",
};

export function OrgAdminSidebar() {
  const mainLinks = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Manage Exams", path: "/admin/exams", icon: BookOpen },
    { name: "Create Exam", path: "/admin/create-exam", icon: BookPlus },
    { name: "Manage Users", path: "/admin/users", icon: Users },
    { name: "University", path: "/admin/university", icon: School },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, hasBell: true },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const logoutLink = { name: "Log out", path: "/admin/logout", icon: LogOut };

  return (
    <div className="fixed top-0 left-0 z-40 h-screen bg-white p-4 w-20 md:w-64 flex flex-col justify-between shadow-lg shadow-blue-200 rounded-tr-2xl rounded-br-2xl">
      {/* Top Section */}
      <div>
        <div className="hidden md:flex items-center justify-center mb-4">
          <img src={ucscLogo} alt="UCSC Logo" className="h-16" draggable={false} />
        </div>

        <div className="hidden md:block text-center mb-12 text-lg font-semibold text-blue-800 select-none">
          UCSC<br />University Gateway Solutions
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-5">
          {mainLinks.map(({ name, path, icon: Icon, hasBell }) => (
            <NavLink
              key={name}
              to={path}
              end={name === "Dashboard"}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform ${
                  isActive
                    ? "bg-blue-100 text-blue-800 font-bold border-l-4 border-blue-700 scale-105"
                    : "text-blue-800 hover:bg-blue-50 hover:scale-105"
                }`
              }
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {hasBell && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </div>
              <span className="hidden md:inline transition-all duration-300">{name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User Info + Logout */}
      <div className="mt-6 space-y-6 pb-12">
        {/* User Info */}
        <div className="flex flex-col items-center justify-center gap-3 px-4">
          <Avatar className="h-10 w-10 ring-2 ring-blue-200">
            <AvatarImage src={mockAdmin.avatar} alt={mockAdmin.name} />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-sm text-center leading-tight">
            <span className="font-medium text-blue-800">{mockAdmin.name}</span>
            <span className="text-gray-500">{mockAdmin.role}</span>
            <span className="text-gray-400 text-xs mt-1">{mockAdmin.university}</span>
          </div>
        </div>

        {/* Logout */}
        <NavLink
          to={logoutLink.path}
          className={({ isActive }) =>
            `group flex items-center justify-center gap-3 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform ${
              isActive
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

export default OrgAdminSidebar;