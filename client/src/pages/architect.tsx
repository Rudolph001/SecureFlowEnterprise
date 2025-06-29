import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Architect() {
  const { data: mlModels } = useQuery({
    queryKey: ['/api/ml-models'],
  });

  const architectMetrics = [
    {
      title: "Behavioral Patterns",
      value: "12,456",
      trend: { value: "+234", isPositive: true, period: "last week" },
      icon: "fas fa-brain",
      iconColor: "text-purple-600",
    },
    {
      title: "Anomalies Detected",
      value: "89",
      trend: { value: "+15%", isPositive: false, period: "last week" },
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-amber-600",
    },
    {
      title: "Model Accuracy",
      value: "96.2%",
      trend: { value: "+1.2%", isPositive: true, period: "last month" },
      icon: "fas fa-bullseye",
      iconColor: "text-green-600",
    },
    {
      title: "Learning Progress",
      value: "73%",
      trend: { value: "+8%", isPositive: true, period: "training cycle" },
      icon: "fas fa-graduation-cap",
      iconColor: "text-blue-600",
    },
  ];

  const mockAnomalies = [
    {
      id: 1,
      user: "intern@company.com",
      behavior: "Unusual external communication",
      description: "Sending emails to competitor domains",
      riskScore: 0.85,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "investigating",
      pattern: "Communication anomaly",
    },
    {
      id: 2,
      user: "manager@company.com",
      behavior: "Abnormal email volume",
      description: "300% increase in outbound emails",
      riskScore: 0.72,
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      status: "monitoring",
      pattern: "Volume anomaly",
    },
    {
      id: 3,
      user: "developer@company.com",
      behavior: "Unusual attachment types",
      description: "Sending code files to personal email",
      riskScore: 0.68,
      timestamp: new Date(Date.now() - 28 * 60 * 1000),
      status: "resolved",
      pattern: "Content anomaly",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      investigating: "destructive",
      monitoring: "secondary",
      resolved: "default",
    };
    return variants[status as keyof typeof variants] || "default";
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return "text-red-600";
    if (score >= 0.6) return "text-amber-600";
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
        title="Architect Module"
        description="Advanced behavioral analytics with deep policy insights and machine learning"
        threatLevel="medium"
        alertCount={4}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {architectMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Behavioral Anomalies */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Behavioral Anomaly Detection</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">AI Learning Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockAnomalies.map((anomaly) => (
                    <div key={anomaly.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getStatusBadge(anomaly.status)}>
                              {anomaly.status.toUpperCase()}
                            </Badge>
                            <span className={`text-sm font-medium ${getRiskColor(anomaly.riskScore)}`}>
                              Risk: {(anomaly.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">{anomaly.behavior}</h4>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">User:</span> {anomaly.user}
                          </p>
                          <p className="text-sm text-slate-500 mb-2">{anomaly.description}</p>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {anomaly.pattern}
                          </span>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-slate-500">{formatTimeAgo(anomaly.timestamp)}</span>
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

          {/* ML Model Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-learning">Auto Learning</Label>
                  <Switch id="auto-learning" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="federated-learning">Federated Learning</Label>
                  <Switch id="federated-learning" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="pattern-detection">Pattern Detection</Label>
                  <Switch id="pattern-detection" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="anomaly-scoring">Anomaly Scoring</Label>
                  <Switch id="anomaly-scoring" defaultChecked />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Training Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Current Cycle</span>
                    <span className="text-sm font-medium">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Data Processed</span>
                      <span className="font-medium">2.4M samples</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Training Time</span>
                      <span className="font-medium">14h 23m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ETA</span>
                      <span className="font-medium">5h 12m</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Update Learning
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Behavioral Analysis Model</span>
                    <span className="text-sm font-semibold text-purple-600">96.2%</span>
                  </div>
                  <Progress value={96.2} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Anomaly Detection Model</span>
                    <span className="text-sm font-semibold text-blue-600">94.8%</span>
                  </div>
                  <Progress value={94.8} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Pattern Recognition Model</span>
                    <span className="text-sm font-semibold text-green-600">98.1%</span>
                  </div>
                  <Progress value={98.1} className="h-2" />
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Model Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-900">98.2%</p>
                      <p className="text-xs text-green-700">Precision</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-900">96.8%</p>
                      <p className="text-xs text-blue-700">Recall</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-900">97.5%</p>
                      <p className="text-xs text-purple-700">F1 Score</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-lg font-bold text-amber-900">0.95</p>
                      <p className="text-xs text-amber-700">AUC</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behavioral Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-clock text-blue-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Time Patterns</h4>
                  </div>
                  <p className="text-sm text-slate-600">Peak email activity: 9-11 AM, 2-4 PM</p>
                  <p className="text-xs text-slate-500">87% of users follow this pattern</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-users text-green-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Communication Networks</h4>
                  </div>
                  <p className="text-sm text-slate-600">Average 23 contacts per user</p>
                  <p className="text-xs text-slate-500">95% internal, 5% external communication</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-chart-bar text-amber-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Volume Patterns</h4>
                  </div>
                  <p className="text-sm text-slate-600">Average 47 emails per day per user</p>
                  <p className="text-xs text-slate-500">12% increase from last month</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-paperclip text-purple-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Attachment Behavior</h4>
                  </div>
                  <p className="text-sm text-slate-600">78% PDF, 15% Office docs, 7% other</p>
                  <p className="text-xs text-slate-500">Large files rare (2% of emails)</p>
                </div>
              </div>

              <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-network-wired text-2xl text-slate-400 mb-1"></i>
                  <p className="text-xs text-slate-600">Communication Graph</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
