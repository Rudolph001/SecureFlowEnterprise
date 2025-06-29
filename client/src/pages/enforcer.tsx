import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Enforcer() {
  const enforcerMetrics = [
    {
      title: "Blocked Attempts",
      value: "12",
      trend: { value: "+4", isPositive: true, period: "last day" },
      icon: "fas fa-ban",
      iconColor: "text-red-600",
    },
    {
      title: "Data Volume Saved",
      value: "2.4 GB",
      trend: { value: "+1.2 GB", isPositive: true, period: "last week" },
      icon: "fas fa-database",
      iconColor: "text-blue-600",
    },
    {
      title: "Policy Violations",
      value: "45",
      trend: { value: "-8%", isPositive: true, period: "last month" },
      icon: "fas fa-exclamation-circle",
      iconColor: "text-amber-600",
    },
    {
      title: "Enforcement Rate",
      value: "98.7%",
      trend: { value: "+0.3%", isPositive: true, period: "last week" },
      icon: "fas fa-shield-check",
      iconColor: "text-green-600",
    },
  ];

  const mockBlockedAttempts = [
    {
      id: 1,
      user: "jane.smith@company.com",
      recipient: "jane.personal@gmail.com",
      dataType: "Customer Database",
      size: "45 MB",
      riskScore: 0.98,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      action: "blocked",
      policy: "Data Exfiltration Prevention",
    },
    {
      id: 2,
      user: "mike.johnson@company.com",
      recipient: "competitor@rival.com",
      dataType: "Financial Reports",
      size: "12 MB",
      riskScore: 0.95,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      action: "blocked",
      policy: "Competitor Communication Block",
    },
    {
      id: 3,
      user: "sarah.wilson@company.com",
      recipient: "sarah.w@outlook.com",
      dataType: "Source Code",
      size: "8.2 MB",
      riskScore: 0.89,
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      action: "quarantined",
      policy: "Intellectual Property Protection",
    },
  ];

  const getActionBadge = (action: string) => {
    const variants = {
      blocked: "destructive",
      quarantined: "secondary",
      warned: "default",
    };
    return variants[action as keyof typeof variants] || "default";
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return `${Math.floor(diffMins / 60)} hours ago`;
  };

  return (
    <>
      <Header
        title="Enforcer Module"
        description="Outbound data exfiltration blocking for unauthorized personal/non-business sends"
        threatLevel="medium"
        alertCount={5}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {enforcerMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Blocked Attempts Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Exfiltration Attempts</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Active Enforcement</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockBlockedAttempts.map((attempt) => (
                    <div key={attempt.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getActionBadge(attempt.action)}>
                              {attempt.action.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-red-600">
                              Risk: {(attempt.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">
                            {attempt.dataType} - {attempt.size}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">User:</span> {attempt.user} →{" "}
                            <span className="font-medium">To:</span> {attempt.recipient}
                          </p>
                          <p className="text-sm text-slate-500">
                            <i className="fas fa-shield-alt mr-2"></i>
                            Policy: {attempt.policy}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-slate-500">{formatTimeAgo(attempt.timestamp)}</span>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Enforcement Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Enforcement Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-enforce">Auto-enforcement</Label>
                  <Switch id="auto-enforce" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="quarantine-mode">Quarantine Mode</Label>
                  <Switch id="quarantine-mode" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-notification">User Notifications</Label>
                  <Switch id="user-notification" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-alerts">Admin Alerts</Label>
                  <Switch id="admin-alerts" defaultChecked />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Enforcement Action</Label>
                <Select defaultValue="block">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block & Alert</SelectItem>
                    <SelectItem value="quarantine">Quarantine for Review</SelectItem>
                    <SelectItem value="warn">Warn & Log</SelectItem>
                    <SelectItem value="log">Log Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Risk Thresholds</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">High Risk (Block)</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Medium Risk (Quarantine)</span>
                    <span className="text-sm font-medium">80%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Low Risk (Log)</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700">
                Update Enforcement
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Data Types and Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Protected Data Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-database text-red-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Customer Database</p>
                      <p className="text-xs text-slate-600">5 attempts blocked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">Critical</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-invoice-dollar text-amber-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Financial Data</p>
                      <p className="text-xs text-slate-600">3 attempts blocked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">High</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-code text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Source Code</p>
                      <p className="text-xs text-slate-600">2 attempts blocked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">High</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-id-card text-green-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">PII Data</p>
                      <p className="text-xs text-slate-600">2 attempts blocked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">Medium</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enforcement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-ban text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Total Blocks</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">247</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-pause-circle text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Quarantined</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">89</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-exclamation-triangle text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Warnings Issued</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">156</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-check-circle text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">False Positives</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">3</span>
                </div>
              </div>

              <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-bar text-2xl text-slate-400 mb-1"></i>
                  <p className="text-xs text-slate-600">Enforcement Trends</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-trophy text-green-600"></i>
                  <div>
                    <p className="text-sm font-medium text-green-900">99.2% Accuracy</p>
                    <p className="text-xs text-green-700">Low false positive rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
