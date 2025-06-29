import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function Defender() {
  const defenderMetrics = [
    {
      title: "Threats Detected",
      value: "89",
      trend: { value: "+15%", isPositive: true, period: "last week" },
      icon: "fas fa-shield-virus",
      iconColor: "text-red-600",
    },
    {
      title: "Phishing Blocked",
      value: "67",
      trend: { value: "+22%", isPositive: true, period: "last week" },
      icon: "fas fa-fish",
      iconColor: "text-amber-600",
    },
    {
      title: "Malware Stopped",
      value: "12",
      trend: { value: "-5%", isPositive: true, period: "last week" },
      icon: "fas fa-bug",
      iconColor: "text-purple-600",
    },
    {
      title: "Detection Rate",
      value: "99.7%",
      trend: { value: "+0.2%", isPositive: true, period: "last month" },
      icon: "fas fa-bullseye",
      iconColor: "text-green-600",
    },
  ];

  const mockThreats = [
    {
      id: 1,
      type: "phishing",
      sender: "admin@fake-bank.com",
      recipient: "john.doe@company.com",
      subject: "Urgent: Verify Your Account Immediately",
      threatScore: 0.97,
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      status: "blocked",
      indicators: ["Suspicious domain", "Urgency language", "Credential request"],
    },
    {
      id: 2,
      type: "impersonation",
      sender: "ceo@comp4ny.com",
      recipient: "finance@company.com",
      subject: "Wire Transfer Request - Confidential",
      threatScore: 0.94,
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      status: "quarantined",
      indicators: ["Domain spoofing", "CEO impersonation", "Financial request"],
    },
    {
      id: 3,
      type: "malware",
      sender: "support@legitimate-looking.com",
      recipient: "it@company.com",
      subject: "System Update Required",
      threatScore: 0.89,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: "blocked",
      indicators: ["Malicious attachment", "Fake software update"],
    },
  ];

  const getThreatIcon = (type: string) => {
    const icons = {
      phishing: "fas fa-fish text-red-600",
      impersonation: "fas fa-mask text-amber-600",
      malware: "fas fa-bug text-purple-600",
      spam: "fas fa-envelope-open-text text-gray-600",
    };
    return icons[type as keyof typeof icons] || "fas fa-exclamation-triangle text-gray-600";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      blocked: "destructive",
      quarantined: "secondary",
      warned: "default",
    };
    return variants[status as keyof typeof variants] || "default";
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
        title="Defender Module"
        description="Inbound phishing & impersonation detection with AI-based threat analysis"
        threatLevel="high"
        alertCount={8}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {defenderMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Threat Detection Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inbound Threat Detection</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">AI Analysis Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockThreats.map((threat) => (
                    <div key={threat.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <i className={getThreatIcon(threat.type)}></i>
                            <Badge variant={getStatusBadge(threat.status)}>
                              {threat.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-red-600">
                              Threat: {(threat.threatScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">{threat.subject}</h4>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">From:</span> {threat.sender} →{" "}
                            <span className="font-medium">To:</span> {threat.recipient}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {threat.indicators.map((indicator, index) => (
                              <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-slate-500">{formatTimeAgo(threat.timestamp)}</span>
                          <Button variant="outline" size="sm">
                            Analyze
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Defender Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Defense Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-analysis">AI Analysis</Label>
                  <Switch id="ai-analysis" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="real-time-scan">Real-time Scanning</Label>
                  <Switch id="real-time-scan" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="url-sandbox">URL Sandboxing</Label>
                  <Switch id="url-sandbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="attachment-scan">Attachment Scanning</Label>
                  <Switch id="attachment-scan" defaultChecked />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Detection Models</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Phishing Model</span>
                    <span className="text-sm font-medium">99.4%</span>
                  </div>
                  <Progress value={99.4} className="h-2" />
                  
                  <div className="flex justify-between items-center mb-1 mt-3">
                    <span className="text-sm text-slate-600">Malware Model</span>
                    <span className="text-sm font-medium">98.8%</span>
                  </div>
                  <Progress value={98.8} className="h-2" />
                  
                  <div className="flex justify-between items-center mb-1 mt-3">
                    <span className="text-sm text-slate-600">Impersonation Model</span>
                    <span className="text-sm font-medium">97.2%</span>
                  </div>
                  <Progress value={97.2} className="h-2" />
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700">
                Update Defense
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Threat Intelligence and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-globe text-red-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Malicious Domains</p>
                      <p className="text-xs text-slate-600">1,247 in blocklist</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">+12 new</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-fingerprint text-amber-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">IP Reputation</p>
                      <p className="text-xs text-slate-600">567 suspicious IPs</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">+8 new</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-code text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Malware Signatures</p>
                      <p className="text-xs text-slate-600">23,891 signatures</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">+45 new</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-shield-alt text-purple-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">IOCs</p>
                      <p className="text-xs text-slate-600">12,456 indicators</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">+23 new</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defense Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-fish text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Phishing Attempts</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">1,247</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-mask text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Impersonations</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">89</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-bug text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Malware Blocked</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">34</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-link text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Malicious URLs</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">567</span>
                </div>
              </div>

              <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-line text-2xl text-slate-400 mb-1"></i>
                  <p className="text-xs text-slate-600">Threat Trends</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-900">99.7%</p>
                  <p className="text-xs text-green-700">Detection Rate</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-900">0.3%</p>
                  <p className="text-xs text-blue-700">False Positives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
