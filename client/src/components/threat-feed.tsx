import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ThreatEvent {
  id: number;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  module: string;
  status: string;
}

export default function ThreatFeed() {
  const { data: threatEvents, isLoading } = useQuery({
    queryKey: ['/api/email-events/threats'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getSeverityIcon = (severity: string) => {
    const icons = {
      critical: 'fas fa-skull-crossbones text-red-600',
      high: 'fas fa-exclamation-triangle text-amber-600',
      medium: 'fas fa-info-circle text-blue-600',
      low: 'fas fa-check-circle text-green-600',
    };
    return icons[severity as keyof typeof icons] || icons.medium;
  };

  const getSeverityClass = (severity: string) => {
    return {
      critical: 'tessian-threat-item critical',
      high: 'tessian-threat-item high',
      medium: 'tessian-threat-item medium',
      low: 'tessian-threat-item low',
    }[severity] || 'tessian-threat-item medium';
  };

  const getActionButtonClass = (severity: string) => {
    const classes = {
      critical: 'text-red-600 hover:text-red-800',
      high: 'text-amber-600 hover:text-amber-800',
      medium: 'text-blue-600 hover:text-blue-800',
      low: 'text-green-600 hover:text-green-800',
    };
    return classes[severity as keyof typeof classes] || classes.medium;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  // Mock data for demonstration since we don't have real threat events
  const mockThreatEvents = [
    {
      id: 1,
      alertType: 'phishing',
      severity: 'critical' as const,
      title: 'Phishing Attempt Blocked',
      description: 'User: jane.smith@company.com attempted to access suspicious link',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      module: 'Defender Module',
      status: 'blocked',
    },
    {
      id: 2,
      alertType: 'misdirection',
      severity: 'high' as const,
      title: 'Misdirected Email Warning',
      description: 'User: mike.johnson@company.com sending confidential data externally',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      module: 'Guardian Module',
      status: 'warned',
    },
    {
      id: 3,
      alertType: 'training',
      severity: 'medium' as const,
      title: 'User Training Completed',
      description: '15 users completed phishing awareness training',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      module: 'Coach Module',
      status: 'completed',
    },
  ];

  const events = threatEvents || mockThreatEvents;

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Real-time Threat Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4 p-4 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Real-time Threat Detection</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Live Feed</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {events.map((event: ThreatEvent) => (
              <div key={event.id} className={getSeverityClass(event.severity)}>
                <div className="w-8 h-8 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className={cn(getSeverityIcon(event.severity), "text-sm")}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {formatTimeAgo(event.timestamp)} • {event.module}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn("text-sm font-medium", getActionButtonClass(event.severity))}
                >
                  {event.severity === 'critical' ? 'Investigate' : 
                   event.severity === 'high' ? 'Review' : 'View Report'}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
