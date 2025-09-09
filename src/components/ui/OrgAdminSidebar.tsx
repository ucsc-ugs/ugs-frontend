// src/components/ui/OrgAdminSidebar.tsx
import {
  Home,
  Users,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Target,
  DollarSign,
  Megaphone,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
  const [isExamsOpen, setIsExamsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string; university?: string; avatar?: string } | null>(null);
  const location = useLocation();

  // Close dropdowns when navigating to non-related routes
  useEffect(() => {
    const examPaths = ["/admin/manage-exams", "/admin/publish-results"];
    const userPaths = ["/admin/student-management", "/admin/manage-users"];

    if (!examPaths.includes(location.pathname)) {
      setIsExamsOpen(false);
    }
    if (!userPaths.includes(location.pathname)) {
      setIsUsersOpen(false);
    }
  }, [location.pathname]);

  // Handler to close dropdowns when clicking other nav items
  const handleNavClick = () => {
    setIsExamsOpen(false);
    setIsUsersOpen(false);
  };

  useEffect(() => {
    // Fetch user info from backend (adjust endpoint as needed)
    const token = localStorage.getItem('auth_token');
    axios.get(
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : 'http://localhost:8000') + '/api/user',
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    )
      .then(res => {
        setUser({
          id: String(res.data.id),
          name: res.data.name,
          role: res.data.role || 'University Admin',
          university: res.data.university || 'University of Colombo',
          avatar: res.data.avatar || profileSample
        });
      })
      .catch(() => setUser(null));
  }, []);

  const mainLinks = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Finance Dashboard", path: "/admin/finance", icon: DollarSign },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, hasBell: true },
    { name: "Set Announcements", path: "/admin/set-announcements", icon: Megaphone },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const examLinks = [
    { name: "Manage Exams", path: "/admin/manage-exams", icon: BookOpen },
    { name: "Publish Results", path: "/admin/publish-results", icon: Target },
  ];

  const userLinks = [
    { name: "Manage Students", path: "/admin/student-management", icon: GraduationCap },
    { name: "Manage Admin", path: "/admin/manage-users", icon: Users },
  ];

  const logoutLink = { name: "Log out", path: "/admin/logout", icon: LogOut };

  return (
    <div className="fixed top-0 left-0 z-40 h-screen bg-white p-2 sm:p-4 w-16 sm:w-20 lg:w-64 flex flex-col justify-between shadow-lg shadow-blue-200 rounded-tr-2xl rounded-br-2xl transition-all duration-300">
      {/* Top Section */}
      <div>
        <div className="hidden lg:flex items-center justify-center mb-4">
          <img src={ucscLogo} alt="UCSC Logo" className="h-12 xl:h-16" draggable={false} />
        </div>

        <div className="hidden lg:block text-center mb-8 xl:mb-12 text-base xl:text-lg font-semibold text-blue-800 select-none">
          UCSC<br />University Gateway Solutions
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-2">
          {/* Dashboard */}
          {mainLinks.slice(0, 1).map(({ name, path, icon: Icon, hasBell }) => (
            <NavLink
              key={name}
              to={path}
              end={name === "Dashboard"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-3 lg:py-3 rounded-md transition-all duration-200 ease-in-out transform ${isActive
                  ? "bg-blue-100 text-blue-800 font-bold border-l-2 lg:border-l-4 border-blue-700 scale-105"
                  : "text-blue-800 hover:bg-blue-50 hover:scale-105"
                }`
              }
              title={name}
            >
              <div className="relative flex-shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {hasBell && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full" />
                )}
              </div>
              <span className="hidden lg:inline transition-all duration-300 text-sm xl:text-base truncate">{name}</span>
            </NavLink>
          ))}

          {/* Exams Dropdown */}
          <div className="mt-1">
            <button
              onClick={() => setIsExamsOpen(!isExamsOpen)}
              className="group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-3 lg:py-3 rounded-md transition-all duration-200 ease-in-out transform text-blue-800 hover:bg-blue-50 hover:scale-105 w-full"
              title="Exams"
            >
              <div className="relative flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="hidden lg:inline transition-all duration-300 text-sm xl:text-base truncate flex-1 text-left">Exams</span>
              <div className="hidden lg:block">
                {isExamsOpen ? (
                  <ChevronDown className="h-3 w-3 xl:h-4 xl:w-4" />
                ) : (
                  <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4" />
                )}
              </div>
            </button>

            {/* Exam Sub-links */}
            {isExamsOpen && (
              <div className="mt-2 space-y-1 lg:ml-4">
                {examLinks.map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    className={({ isActive }) =>
                      `group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-2 lg:py-2 rounded-md transition-all duration-200 ease-in-out transform ${isActive
                        ? "bg-blue-100 text-blue-800 font-bold border-l-2 lg:border-l-4 border-blue-700 scale-105"
                        : "text-blue-700 hover:bg-blue-50 hover:scale-105"
                      }`
                    }
                    title={name}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="hidden lg:inline transition-all duration-300 text-xs xl:text-sm truncate">{name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Manage Users Dropdown */}
          <div className="mt-1">
            <button
              onClick={() => setIsUsersOpen(!isUsersOpen)}
              className="group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-3 lg:py-3 rounded-md transition-all duration-200 ease-in-out transform text-blue-800 hover:bg-blue-50 hover:scale-105 w-full"
              title="Manage Users"
            >
              <div className="relative flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="hidden lg:inline transition-all duration-300 text-sm xl:text-base truncate flex-1 text-left">Manage Users</span>
              <div className="hidden lg:block">
                {isUsersOpen ? (
                  <ChevronDown className="h-3 w-3 xl:h-4 xl:w-4" />
                ) : (
                  <ChevronRight className="h-3 w-3 xl:h-4 xl:w-4" />
                )}
              </div>
            </button>

            {/* User Sub-links */}
            {isUsersOpen && (
              <div className="mt-2 space-y-1 lg:ml-4">
                {userLinks.map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    className={({ isActive }) =>
                      `group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-2 lg:py-2 rounded-md transition-all duration-200 ease-in-out transform ${isActive
                        ? "bg-blue-100 text-blue-800 font-bold border-l-2 lg:border-l-4 border-blue-700 scale-105"
                        : "text-blue-700 hover:bg-blue-50 hover:scale-105"
                      }`
                    }
                    title={name}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="hidden lg:inline transition-all duration-300 text-xs xl:text-sm truncate">{name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Remaining Links in new order: Finance Dashboard, Notifications, Set Announcements, Settings */}
          {[mainLinks[1], ...mainLinks.slice(2)].map(({ name, path, icon: Icon, hasBell }) => (
            <NavLink
              key={name}
              to={path}
              onClick={handleNavClick}
              className={({ isActive }) => {
                // Special handling for Set Announcements to include create/edit routes
                const isAnnouncementActive = name === "Set Announcements" &&
                  (location.pathname === path ||
                    location.pathname === '/admin/create-announcement' ||
                    location.pathname.startsWith('/admin/edit-announcement'));

                const shouldBeActive = isActive || isAnnouncementActive;

                return `group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-3 lg:py-3 rounded-md transition-all duration-200 ease-in-out transform ${shouldBeActive
                  ? "bg-blue-100 text-blue-800 font-bold border-l-2 lg:border-l-4 border-blue-700 scale-105"
                  : "text-blue-800 hover:bg-blue-50 hover:scale-105"
                  }`;
              }}
              title={name}
            >
              <div className="relative flex-shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {hasBell && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full" />
                )}
              </div>
              <span className="hidden lg:inline transition-all duration-300 text-sm xl:text-base truncate">{name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User Info + Logout */}
      <div className="mt-4 lg:mt-6 space-y-3 lg:space-y-6 pb-6 lg:pb-12">
        {/* User Info */}
        <div className="flex flex-col items-center justify-center gap-2 lg:gap-3 px-2 lg:px-4">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-blue-200">
            <AvatarImage src={user?.avatar || profileSample} alt={user?.name || 'User'} />
            <AvatarFallback>{user?.name?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col text-xs xl:text-sm text-center leading-tight">
            <span className="font-medium text-blue-800 truncate max-w-full">{user?.name || mockAdmin.name}</span>
            <span className="text-gray-500 truncate max-w-full">{user?.role || mockAdmin.role}</span>
            <span className="text-gray-400 text-xs mt-1 truncate max-w-full">{user?.university || mockAdmin.university}</span>
            {user?.id && (
              <span className="text-gray-400 text-xs mt-1 truncate max-w-full">ID: {user.id}</span>
            )}
          </div>
        </div>

        {/* Logout */}
        <NavLink
          to={logoutLink.path}
          onClick={handleNavClick}
          className={({ isActive }) =>
            `group flex items-center justify-center gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-2 rounded-md transition-all duration-200 ease-in-out transform ${isActive
              ? "bg-red-100 text-red-600 font-bold border-l-2 lg:border-l-4 border-red-600 scale-105"
              : "text-red-600 hover:bg-red-50 hover:scale-105"
            }`
          }
          title="Log out" // Tooltip for mobile/small screens
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
          <span className="hidden lg:inline transition-all duration-300 text-sm xl:text-base">
            {logoutLink.name}
          </span>
        </NavLink>
      </div>
    </div>
  );
}

export default OrgAdminSidebar;