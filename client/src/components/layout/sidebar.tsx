import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  BarChart3, 
  Eye, 
  Ban, 
  ShieldCheck, 
  Brain, 
  GraduationCap,
  Settings,
  Users,
  Bot,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
];

const securityModules = [
  { name: "Guardian", href: "/guardian", icon: Eye, status: "Active", color: "green" },
  { name: "Enforcer", href: "/enforcer", icon: Ban, status: "Active", color: "red" },
  { name: "Defender", href: "/defender", icon: ShieldCheck, status: "Active", color: "blue" },
  { name: "Architect", href: "/architect", icon: Brain, status: "Learning", color: "purple" },
  { name: "Coach", href: "/coach", icon: GraduationCap, status: "Active", color: "green" },
];

const management = [
  { name: "Policy Builder", href: "/policy-builder", icon: Settings },
  { name: "Identity & Access", href: "/identity-access", icon: Users },
  { name: "ML Models", href: "/ml-models", icon: Bot },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

const statusColors = {
  green: "bg-green-500",
  red: "bg-red-500", 
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
};

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Tessian Enterprise</h1>
            </div>
            <Button
              variant="ghost" 
              size="sm"
              className="lg:hidden text-white hover:bg-slate-800"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary text-white"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
            
            {/* Security Modules */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-4">
                Security Modules
              </p>
              
              {securityModules.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-white"
                        : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    )}>
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="flex-1">{item.name}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full text-white",
                        item.status === "Active" ? "bg-green-500" : "bg-amber-500"
                      )}>
                        {item.status}
                      </span>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Management */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-4">
                Management
              </p>
              
              {management.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-white"
                        : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    )}>
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-slate-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">John Doe</p>
                <p className="text-xs text-slate-400 truncate">Security Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
