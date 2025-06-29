import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, Shield, Activity } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: systemHealth } = useQuery({
    queryKey: ["/api/system/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-4"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Security Dashboard</h2>
            <p className="text-sm text-slate-600 mt-1">
              Real-time email security monitoring and threat prevention
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Threat Level Indicator */}
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            <Shield className="w-4 h-4 mr-2" />
            Threat Level: Low
          </Badge>
          
          {/* Real-time Status */}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live Monitoring
          </Badge>
          
          {/* System Health */}
          {systemHealth && (
            <Badge 
              variant="secondary" 
              className="bg-slate-100 text-slate-800 hover:bg-slate-100"
            >
              <Activity className="w-4 h-4 mr-2" />
              {systemHealth.apiResponseTime}ms
            </Badge>
          )}
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
