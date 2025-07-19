// src/layout/PortalLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/ui/Sidebar";

export default function PortalLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
