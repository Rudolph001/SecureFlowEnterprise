import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { getAuthState } from "@/lib/auth";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
];

const securityModules = [
  { path: "/guardian", label: "Guardian", icon: "fas fa-eye", status: "Active" },
  { path: "/enforcer", label: "Enforcer", icon: "fas fa-ban", status: "Active" },
  { path: "/defender", label: "Defender", icon: "fas fa-shield-virus", status: "Active" },
  { path: "/architect", label: "Architect", icon: "fas fa-brain", status: "Learning" },
  { path: "/coach", label: "Coach", icon: "fas fa-graduation-cap", status: "Active" },
];

const managementItems = [
  { path: "/policy-builder", label: "Policy Builder", icon: "fas fa-cogs" },
  { path: "/identity-access", label: "Identity & Access", icon: "fas fa-users" },
  { path: "/ml-models", label: "ML Models", icon: "fas fa-robot" },
  { path: "/analytics", label: "Analytics", icon: "fas fa-chart-bar" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const authState = getAuthState();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Active: "bg-green-500",
      Learning: "bg-blue-500",
      Training: "bg-amber-500",
      Error: "bg-red-500",
    };

    return (
      <span
        className={cn(
          "ml-auto text-xs px-2 py-1 rounded-full text-white",
          statusClasses[status as keyof typeof statusClasses] || "bg-gray-500"
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-64 tessian-sidebar flex flex-col">
      {/* Logo/Brand */}
      <div className="flex items-center px-6 py-4 border-b border-slate-700">
        <div className="w-8 h-8 bg-tessian-primary rounded-lg flex items-center justify-center mr-3">
          <i className="fas fa-shield-alt text-white text-lg"></i>
        </div>
        <h1 className="text-xl font-bold">Tessian Enterprise</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {/* Main Navigation */}
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "tessian-sidebar-item",
                isActive(item.path) ? "active" : "text-slate-300 hover:text-white"
              )}
            >
              <i className={cn(item.icon, "mr-3")}></i>
              <span>{item.label}</span>
            </a>
          </Link>
        ))}

        {/* Security Modules */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Security Modules
          </p>
          {securityModules.map((module) => (
            <Link key={module.path} href={module.path}>
              <a
                className={cn(
                  "tessian-sidebar-item",
                  isActive(module.path) ? "active" : "text-slate-300 hover:text-white"
                )}
              >
                <i className={cn(module.icon, "mr-3")}></i>
                <span>{module.label}</span>
                {getStatusBadge(module.status)}
              </a>
            </Link>
          ))}
        </div>

        {/* Management */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Management
          </p>
          {managementItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "tessian-sidebar-item",
                  isActive(item.path) ? "active" : "text-slate-300 hover:text-white"
                )}
              >
                <i className={cn(item.icon, "mr-3")}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-tessian-primary rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium">
              {authState.user?.firstName?.[0]}{authState.user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {authState.user?.firstName} {authState.user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {authState.user?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <i className="fas fa-chevron-up text-slate-400"></i>
        </div>
      </div>
    </div>
  );
}
