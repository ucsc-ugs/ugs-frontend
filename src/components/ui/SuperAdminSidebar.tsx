import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  Settings,
  BookOpen,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuperAdminAuth } from "@/contexts/SuperAdminAuthContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function SuperAdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useSuperAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/admin/logout");
    setShowLogoutConfirm(false);
  };

  const navItems = [
    {
      to: "/super-admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      end: true
    },
    {
      to: "/super-admin/organizations",
      icon: Building2,
      label: "Manage Organizations"
    },
    {
      to: "/super-admin/org-admins",
      icon: Users,
      label: "Manage Org Admins"
    },
    {
      to: "/super-admin/exams",
      icon: BookOpen,
      label: "Manage Exams"
    },
    {
      to: "/super-admin/revenue",
      icon: DollarSign,
      label: "Revenue"
    }
  ];

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } z-50`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <Shield className="h-8 w-8 text-blue-400 flex-shrink-0" />
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold">Super Admin</h1>
                  <p className="text-xs text-slate-400">System Control</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-white p-1"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">Super Admin</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings and Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="space-y-2">
            {!isCollapsed && (
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`${isCollapsed ? 'w-full justify-center' : 'w-full justify-start'} text-red-400 hover:bg-red-600/20 hover:text-red-300`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout from the super admin panel?"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}
