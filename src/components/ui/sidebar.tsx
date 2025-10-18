// src/components/ui/Sidebar.tsx
import { useState } from "react";
import {
  Home,
  UserPlus,
  BookOpen,
  Bell,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import ucscLogo from "@/assets/ucsc_logo.png";
import { Avatar, AvatarFallback } from "./avatar";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const mainLinks = [
    { name: "Home", path: "/portal", icon: Home },
    { name: "Register", path: "/portal/register", icon: UserPlus },
    { name: "My Exams", path: "/portal/my-exams", icon: BookOpen },
    {
      name: "Notifications",
      path: "/portal/notifications",
      icon: Bell,
      hasBell: true, // use this to render badge
    },
  ];

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    navigate("/portal/logout");
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const handleProfileClick = () => {
    navigate("/portal/profile");
  };

  // Generate user's email for display
  const getUserDisplayInfo = () => {
    return user?.email || 'No email';
  };

  return (
    <div
      className={`

    fixed top-0 left-0 z-40
    h-screen bg-white p-4
    w-20 md:w-64
    flex flex-col justify-between
    transition-all duration-300 ease-in-out
    shadow-lg shadow-blue-200
    rounded-tr-2xl rounded-br-2xl
  `}

    >
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
              end={name === "Home"}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform ${isActive
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

      {/* 👤 User Info + Logout */}
      <div className="mt-6 space-y-6 pb-12">
        {/* User Info */}
        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center justify-center gap-3 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform hover:bg-blue-50 hover:scale-105 w-full group"
        >
          <Avatar className="h-10 w-10 ring-2 ring-blue-200 group-hover:ring-blue-300 transition-all">
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-sm text-center leading-tight">
            <span className="font-medium text-blue-800 group-hover:text-blue-900">
              {user?.name || "Loading..."}
            </span>
            <span className="text-gray-500 text-xs">
              {getUserDisplayInfo()}
            </span>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className="group flex items-center justify-center gap-3 px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform text-red-600 hover:bg-red-50 hover:scale-105 w-full"
        >
          <LogOut className="h-5 w-5 text-red-600" />
          <span className="hidden md:inline transition-all duration-300">
            Log out
          </span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Log out"
        cancelText="Stay logged in"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}

export default Sidebar;
