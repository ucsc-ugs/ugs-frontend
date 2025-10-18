// src/components/ui/OrgAdminSidebar.tsx
import {
  Home,
  Users,
  BookOpen,
  Settings,
  LogOut,
  GraduationCap,
  Target,
  DollarSign,
  Megaphone,
  ChevronDown,
  ChevronRight,
  MapPin,
  Bell,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ucscLogo from "@/assets/ucsc_logo.png";
import profileSample from "@/assets/profile_sample.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const mockAdmin = {
  name: "Admin User",
  role: "University Admin",
  email: "admin@example.com",
  avatar: profileSample,
  university: "University of Colombo",
};

// Helper function to check if user has required permissions
const hasPermission = (userPermissions: string[] | undefined, requiredPermissions: string[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required, always visible
  }
  if (!userPermissions || userPermissions.length === 0) {
    return false; // No user permissions
  }
  // Check if user has at least one of the required permissions
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export function OrgAdminSidebar() {
  const [isExamsOpen, setIsExamsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string; email?: string; university?: string; avatar?: string } | null>(null);
  const location = useLocation();
  const { user: authUser } = useAuth();
  
  // Get user permissions from auth context
  const userPermissions = authUser?.meta?.permissions || [];

  // Close dropdowns when navigating to non-related routes
  useEffect(() => {
    const examPaths = ["/admin/manage-exams", "/admin/locations", "/admin/publish-results"];
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
    // Fetch user info from admin API to get proper organization data
    const token = localStorage.getItem('auth_token');
    const apiUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL
      ? (import.meta as any).env.VITE_API_URL
      : 'http://localhost:8000');

    // First get user info from admin endpoint
    axios.get(`${apiUrl}/api/admin/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (userRes: any) => {
        const userData = userRes.data;

        // Then get organization info
        try {
          const orgRes = await axios.get(`${apiUrl}/api/admin/my-organization`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setUser({
            id: String(userData.id),
            name: userData.data?.name || userData.name,
            email: userData.data?.email || userData.email,
            role: userData.role || 'Org Admin',
            university: orgRes.data.data?.name || 'Unknown Organization',
            avatar: orgRes.data.data?.logo ? `${apiUrl}/storage${orgRes.data.data.logo}` : profileSample
          });
        } catch {
          // Fallback if org data fails
          setUser({
            id: String(userData.id),
            name: userData.data?.name || userData.name,
            email: userData.data?.email || userData.email,
            role: userData.role || 'Org Admin',
            university: 'Unknown Organization',
            avatar: profileSample
          });
        }
      })
      .catch(() => setUser(null));
  }, []);

  const mainLinks = [
    { name: "Dashboard", path: "/admin", icon: Home, permissions: [] },
    { name: "Finance Dashboard", path: "/admin/finance", icon: DollarSign, permissions: ["payments.view", "payments.create", "payments.update"] },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, hasBell: true, permissions: [] },
    { name: "Set Announcements", path: "/admin/set-announcements", icon: Megaphone, permissions: ["announcement.create", "announcement.view", "announcement.update", "announcement.publish"] },
    { name: "Settings", path: "/admin/settings", icon: Settings, permissions: ["organization.view", "organization.update"] },
  ];

  const examLinks = [
    { name: "Manage Exams", path: "/admin/manage-exams", icon: BookOpen, permissions: ["exam.create", "exam.view", "exam.update", "exam.schedule.set", "exam.schedule.update", "exam.registration.deadline.set", "exam.registration.deadline.extend"] },
    { name: "Locations", path: "/admin/locations", icon: MapPin, permissions: ["exam.location.manage"] },
    { name: "Publish Results", path: "/admin/publish-results", icon: Target, permissions: ["exam.view", "exam.update"] },
  ];

  const userLinks = [
    { name: "Manage Students", path: "/admin/student-management", icon: GraduationCap, permissions: ["student.create", "student.view", "student.update", "student.delete", "student.detail.view"] },
    { name: "Manage Admin", path: "/admin/manage-users", icon: Users, permissions: ["organization.admins.create", "organization.admins.view", "organization.admins.update", "organization.admins.delete"] },
  ];

  // Filter links based on user permissions
  const filteredMainLinks = mainLinks.filter(link => hasPermission(userPermissions, link.permissions));
  const filteredExamLinks = examLinks.filter(link => hasPermission(userPermissions, link.permissions));
  const filteredUserLinks = userLinks.filter(link => hasPermission(userPermissions, link.permissions));
  
  // Determine if dropdowns should be shown
  const showExamsDropdown = filteredExamLinks.length > 0;
  const showUsersDropdown = filteredUserLinks.length > 0;

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
          {/* Dashboard - Always first if visible */}
          {filteredMainLinks.slice(0, 1).map(({ name, path, icon: Icon, hasBell }) => (
            <NavLink
              key={name}
              to={path}
              end={name === "Dashboard"}
              onClick={handleNavClick}
              className={({ isActive }: { isActive: boolean }) =>
                `group flex items-center gap-2 lg:gap-4 px-2 sm:px-3 lg:px-4 py-3 lg:py-3 rounded-md transition-all duration-200 ease-in-out transform ${isActive
                  ? "bg-blue-100 text-blue-800 font-bold border-l-2 lg:border-l-4 border-blue-700 scale-105"
                  : "text-blue-800 hover:bg-blue-50 hover:scale-105"
                }`
              }
              title={name}
            >
              <div className="relative flex-shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="hidden lg:inline transition-all duration-300 text-sm xl:text-base truncate">{name}</span>
            </NavLink>
          ))}

          {/* Exams Dropdown - Only show if user has exam permissions */}
          {showExamsDropdown && (
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
                  {filteredExamLinks.map(({ name, path, icon: Icon }) => (
                    <NavLink
                      key={name}
                      to={path}
                      className={({ isActive }: { isActive: boolean }) =>
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
          )}

          {/* Manage Users Dropdown - Only show if user has user management permissions */}
          {showUsersDropdown && (
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
                  {filteredUserLinks.map(({ name, path, icon: Icon }) => (
                    <NavLink
                      key={name}
                      to={path}
                      className={({ isActive }: { isActive: boolean }) =>
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
          )}

          {/* Remaining Links in new order: Finance Dashboard, Notifications, Set Announcements, Settings */}
          {[filteredMainLinks[1], ...filteredMainLinks.slice(2)].filter(Boolean).map(({ name, path, icon: Icon, hasBell }) => (
            <NavLink
              key={name}
              to={path}
              onClick={handleNavClick}
              className={({ isActive }: { isActive: boolean }) => {
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
            <AvatarImage src={user?.avatar || profileSample} alt={authUser?.name || user?.name || 'User'} />
            <AvatarFallback>{(authUser?.name || user?.name || 'A').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col text-xs xl:text-sm text-center leading-tight">
            <span className="font-medium text-blue-800 truncate max-w-full">{authUser?.name || user?.name || mockAdmin.name}</span>
            <span className="text-gray-500 truncate max-w-full">{authUser?.role || user?.role || mockAdmin.role}</span>
            <span className="text-gray-400 text-xs mt-1 truncate max-w-full">{user?.university || mockAdmin.university}</span>
            {(authUser?.id || user?.id) && (
              <span className="text-gray-400 text-xs mt-1 truncate max-w-full">ID: {authUser?.id || user?.id}</span>
            )}
          </div>
        </div>

        {/* Logout */}
        <NavLink
          to={logoutLink.path}
          onClick={handleNavClick}
          className={({ isActive }: { isActive: boolean }) =>
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