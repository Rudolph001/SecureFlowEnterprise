import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description: string;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  showLiveStatus?: boolean;
  alertCount?: number;
}

export default function Header({ 
  title, 
  description, 
  threatLevel = 'low', 
  showLiveStatus = true,
  alertCount = 0 
}: HeaderProps) {
  const getThreatLevelColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const getThreatLevelIcon = (level: string) => {
    const icons = {
      low: 'fas fa-shield-check',
      medium: 'fas fa-shield-alt',
      high: 'fas fa-exclamation-triangle',
      critical: 'fas fa-skull-crossbones',
    };
    return icons[level as keyof typeof icons] || icons.low;
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Threat Level Indicator */}
          <div className={cn(
            "flex items-center px-3 py-2 rounded-lg",
            getThreatLevelColor(threatLevel)
          )}>
            <i className={cn(getThreatLevelIcon(threatLevel), "mr-2")}></i>
            <span className="text-sm font-medium">
              Threat Level: {threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1)}
            </span>
          </div>
          
          {/* Real-time Status */}
          {showLiveStatus && (
            <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">Live Monitoring</span>
            </div>
          )}
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <i className="fas fa-bell text-lg"></i>
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center p-0 text-xs"
              >
                {alertCount > 99 ? '99+' : alertCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
