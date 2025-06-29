import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, UserX, Fingerprint, TrendingUp } from "lucide-react";

interface ThreatStats {
  maliciousDomains: number;
  suspiciousIPs: number;
  impersonationAttempts: number;
}

export default function ThreatIntelligence() {
  const { data, isLoading } = useQuery<{ stats: ThreatStats }>({
    queryKey: ["/api/threat-intelligence"],
    refetchInterval: 60000, // Refresh every minute
  });

  const stats = data?.stats;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threat Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Threat Intelligence
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Malicious Domains</p>
                <p className="text-xs text-slate-600">{stats?.maliciousDomains || 0} new domains identified</p>
              </div>
            </div>
            <Badge variant="destructive">+12%</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <UserX className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Impersonation Attempts</p>
                <p className="text-xs text-slate-600">{stats?.impersonationAttempts || 0} CEO impersonations blocked</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">+8%</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Fingerprint className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">IP Reputation</p>
                <p className="text-xs text-slate-600">{stats?.suspiciousIPs || 0} suspicious IPs tracked</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">+5%</Badge>
          </div>
        </div>

        {/* Threat Intelligence Chart Placeholder */}
        <div className="mt-6 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Threat Intelligence Trends</p>
            <p className="text-xs text-slate-500 mt-1">Real-time threat landscape analysis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
