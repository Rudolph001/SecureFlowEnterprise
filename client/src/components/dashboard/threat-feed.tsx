import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, GraduationCap } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";

interface ThreatEvent {
  id: number;
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  fromAddress: string;
  toAddress: string;
  subject: string;
  moduleSource: string;
  actionTaken: string;
  timeAgo: string;
  metadata: any;
}

const severityColors = {
  low: "bg-blue-50 border-blue-200",
  medium: "bg-amber-50 border-amber-200", 
  high: "bg-red-50 border-red-200",
  critical: "bg-red-100 border-red-300",
};

const moduleIcons = {
  guardian: Eye,
  enforcer: AlertTriangle,
  defender: AlertTriangle,
  architect: AlertTriangle,
  coach: GraduationCap,
};

export default function ThreatFeed() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);
  
  const { data: initialEvents, isLoading } = useQuery<ThreatEvent[]>({
    queryKey: ["/api/dashboard/threat-events"],
    refetchInterval: 30000,
  });

  const { lastMessage } = useWebSocket();

  // Update events when we receive WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === "new_threat_event") {
      setEvents(prev => [lastMessage.data, ...prev.slice(0, 9)]);
    }
  }, [lastMessage]);

  // Initialize events from API
  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Real-time Threat Detection
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">Loading...</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded-lg" />
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
        <CardTitle className="flex items-center justify-between">
          Real-time Threat Detection
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-600">Live Feed</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent threat events</p>
            </div>
          ) : (
            events.map((event) => {
              const Icon = moduleIcons[event.moduleSource as keyof typeof moduleIcons] || AlertTriangle;
              
              return (
                <div
                  key={event.id}
                  className={`threat-event ${event.severity} ${severityColors[event.severity]}`}
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {getEventTitle(event.eventType)}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {getEventDescription(event)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <p className="text-xs text-slate-500">{event.timeAgo}</p>
                          <Badge variant="outline" className="text-xs">
                            {event.moduleSource}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-sm">
                        {getActionButton(event.eventType)}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getEventTitle(eventType: string): string {
  const titles = {
    phishing_blocked: "Phishing Attempt Blocked",
    misdirected_warning: "Misdirected Email Warning", 
    data_exfiltration_prevented: "Data Exfiltration Prevented",
    training_completed: "User Training Completed",
    unusual_recipient: "Unusual Recipient Detected",
    executive_impersonation: "Executive Impersonation Blocked",
  };
  
  return titles[eventType as keyof typeof titles] || "Security Event";
}

function getEventDescription(event: ThreatEvent): string {
  const user = event.toAddress.split("@")[0];
  
  switch (event.eventType) {
    case "phishing_blocked":
      return `User: ${user} attempted to access suspicious link`;
    case "misdirected_warning":
      return `User: ${user} sending confidential data externally`;
    case "data_exfiltration_prevented":
      return `Prevented ${user} from sending sensitive data`;
    case "training_completed":
      return `${event.metadata?.usersCompleted || 0} users completed phishing awareness training`;
    case "unusual_recipient":
      return `${user} emailing unknown recipient`;
    case "executive_impersonation":
      return `Blocked executive impersonation targeting ${user}`;
    default:
      return `Security event involving ${user}`;
  }
}

function getActionButton(eventType: string): string {
  const actions = {
    phishing_blocked: "Investigate",
    misdirected_warning: "Review",
    data_exfiltration_prevented: "Details",
    training_completed: "View Report",
    unusual_recipient: "Approve",
    executive_impersonation: "Investigate",
  };
  
  return actions[eventType as keyof typeof actions] || "View";
}
