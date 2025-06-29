import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Guardian() {
  const { data: emailEvents } = useQuery({
    queryKey: ['/api/email-events'],
  });

  const guardianMetrics = [
    {
      title: "Emails Monitored",
      value: "2,431",
      trend: { value: "+5%", isPositive: true, period: "last hour" },
      icon: "fas fa-eye",
      iconColor: "text-blue-600",
    },
    {
      title: "Misdirected Emails",
      value: "23",
      trend: { value: "-12%", isPositive: true, period: "last week" },
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-amber-600",
    },
    {
      title: "External Recipients",
      value: "156",
      trend: { value: "+8%", isPositive: false, period: "last day" },
      icon: "fas fa-external-link-alt",
      iconColor: "text-red-600",
    },
    {
      title: "Detection Accuracy",
      value: "99.4%",
      trend: { value: "+0.1%", isPositive: true, period: "last month" },
      icon: "fas fa-bullseye",
      iconColor: "text-green-600",
    },
  ];

  const mockMisdirectedEmails = [
    {
      id: 1,
      sender: "john.doe@company.com",
      recipient: "competitor@rival.com",
      subject: "Q4 Financial Reports - CONFIDENTIAL",
      riskScore: 0.95,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: "blocked",
      reason: "Confidential data to external competitor",
    },
    {
      id: 2,
      sender: "sarah.smith@company.com",
      recipient: "sarah.smith@gmail.com",
      subject: "Client Database Export",
      riskScore: 0.87,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: "warned",
      reason: "Personal email with sensitive data",
    },
    {
      id: 3,
      sender: "mike.johnson@company.com",
      recipient: "wrong.person@company.com",
      subject: "Salary Information - HR Confidential",
      riskScore: 0.78,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: "warned",
      reason: "HR data to unauthorized recipient",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      blocked: "destructive",
      warned: "secondary",
      allowed: "default",
    };
    return variants[status as keyof typeof variants] || "default";
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.9) return "text-red-600";
    if (score >= 0.7) return "text-amber-600";
    return "text-green-600";
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
        title="Guardian Module"
        description="Outbound misdirected content detection to prevent accidental data leaks"
        threatLevel="low"
        alertCount={2}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {guardianMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Real-time Monitoring */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Misdirected Email Detection</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Live Monitoring</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockMisdirectedEmails.map((email) => (
                    <div key={email.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getStatusBadge(email.status)}>
                              {email.status.toUpperCase()}
                            </Badge>
                            <span className={`text-sm font-medium ${getRiskColor(email.riskScore)}`}>
                              Risk: {(email.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">{email.subject}</h4>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">From:</span> {email.sender} →{" "}
                            <span className="font-medium">To:</span> {email.recipient}
                          </p>
                          <p className="text-sm text-slate-500">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {email.reason}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-slate-500">{formatTimeAgo(email.timestamp)}</span>
                          <Button variant="outline" size="sm">
                            Investigate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Guardian Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Guardian Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-block">Auto-block High Risk</Label>
                  <Switch id="auto-block" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="external-warning">External Recipient Warnings</Label>
                  <Switch id="external-warning" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dlp-integration">DLP Integration</Label>
                  <Switch id="dlp-integration" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-training">User Training Mode</Label>
                  <Switch id="user-training" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Risk Thresholds</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Block Threshold</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Warning Threshold</span>
                    <span className="text-sm font-medium">70%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Log Threshold</span>
                    <span className="text-sm font-medium">50%</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-tessian-primary hover:bg-tessian-primary/90">
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-contract text-red-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Financial Documents</p>
                      <p className="text-xs text-slate-600">12 instances detected</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">High Risk</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-users text-amber-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Customer Data</p>
                      <p className="text-xs text-slate-600">8 instances detected</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">Medium Risk</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-code text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Source Code</p>
                      <p className="text-xs text-slate-600">3 instances detected</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">Medium Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipient Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-building text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Internal Recipients</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">2,108</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-external-link-alt text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">External Recipients</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">156</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-exclamation-triangle text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Suspicious Recipients</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">23</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-user-friends text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Personal Accounts</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">8</span>
                </div>
              </div>

              <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-2xl text-slate-400 mb-1"></i>
                  <p className="text-xs text-slate-600">Recipient Distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
