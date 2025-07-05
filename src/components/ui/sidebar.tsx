import { cn } from "../../lib/utils";
import { Home, UserPlus, FileText, BarChart2, LogOut, ChevronLeft, User, Search, CreditCard, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

export function Sidebar({ className, onCollapse, ...props }: React.HTMLAttributes<HTMLDivElement> & { onCollapse?: () => void }) {
  return (
    <aside
      className={cn(
        "h-screen w-72 bg-[#1e293b] text-white shadow-xl flex flex-col p-6 border-r border-[#334155] rounded-l-3xl relative transition-all duration-300 font-lato",
        className
      )}
      {...props}
    >
      {/* Collapse button */}
      <button
        className="absolute top-6 right-[-18px] bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center border border-[#334155] hover:bg-[#334155] transition"
        onClick={onCollapse}
        aria-label="Hide Sidebar"
      >
        <ChevronLeft className="w-5 h-5 text-[#334155]" />
      </button>
      <div className="mb-10 flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow p-2 mb-2">
          <img src="/ucsclogo.png" alt="UCSC Logo" className="w-14 h-14" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">UCSC</h1>
        <span className="text-xs text-slate-300 font-medium mt-1">Graduate Portal</span>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        <SidebarLink icon={<Home className="w-5 h-5" />} label="Dashboard" href="/dashboard" />
        <SidebarLink icon={<Search className="w-5 h-5" />} label="Find Exams" href="/find-exams" />
        <SidebarLink icon={<FileText className="w-5 h-5" />} label="My Exams" href="/my-exams" />
        <SidebarLink icon={<BarChart2 className="w-5 h-5" />} label="Results" href="/results" />
        <SidebarLink icon={<User className="w-5 h-5" />} label="Profile" href="/profile" />
        <SidebarLink icon={<CreditCard className="w-5 h-5" />} label="Payment" href="/payment" />
        <SidebarLink icon={<LogIn className="w-5 h-5" />} label="Sign In" href="/login" />
        <SidebarLink icon={<UserPlus className="w-5 h-5" />} label="Sign Up" href="/signup" />
      </nav>
      <div className="mt-auto pt-8">
        <SidebarLink icon={<LogOut className="w-5 h-5 text-red-400" />} label="Log out" className="text-red-400 font-semibold hover:bg-[#334155]" href="/" />
      </div>
    </aside>
  );
}

function SidebarLink({ icon, label, className = "", active = false, href }: { icon: React.ReactNode; label: string; className?: string; active?: boolean; href?: string }) {
  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 text-lg px-4 py-2 rounded-xl transition-colors group",
          active
            ? "bg-white shadow text-indigo-700 font-bold"
            : "text-gray-700 hover:bg-white/70 hover:text-indigo-700",
          className
        )}
      >
        <span className={cn("transition", active ? "text-indigo-700" : "text-gray-400 group-hover:text-indigo-700")}>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <a
      href="#"
      className={cn(
        "flex items-center gap-3 text-lg px-4 py-2 rounded-xl transition-colors group",
        active
          ? "bg-white shadow text-indigo-700 font-bold"
          : "text-gray-700 hover:bg-white/70 hover:text-indigo-700",
        className
      )}
    >
      <span className={cn("transition", active ? "text-indigo-700" : "text-gray-400 group-hover:text-indigo-700")}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
