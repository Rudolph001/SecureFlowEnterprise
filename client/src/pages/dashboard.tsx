import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import ThreatFeed from "@/components/threat-feed";
import ModuleStatus from "@/components/module-status";
import PolicyModal from "@/components/policy-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: dashboardMetrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock data for demonstration
  const mockMetrics = {
    threatsBlocked: 1247,
    usersProtected: 8432,
    emailsAnalyzed: 127000,
    mlAccuracy: 99.4,
    apiResponseTime: 127,
    databasePerformance: 99.9,
  };

  const metrics = dashboardMetrics || mockMetrics;

  const keyMetrics = [
    {
      title: "Threats Blocked",
      value: metrics.threatsBlocked,
      trend: { value: "+12%", isPositive: true, period: "last week" },
      icon: "fas fa-shield-alt",
      iconColor: "text-red-600",
    },
    {
      title: "Users Protected",
      value: metrics.usersProtected,
      trend: { value: "+3%", isPositive: true, period: "last week" },
      icon: "fas fa-users",
      iconColor: "text-blue-600",
    },
    {
      title: "Emails Analyzed",
      value: `${Math.round(metrics.emailsAnalyzed / 1000)}K`,
      trend: { value: "+8%", isPositive: true, period: "last week" },
      icon: "fas fa-envelope",
      iconColor: "text-green-600",
    },
    {
      title: "ML Accuracy",
      value: `${metrics.mlAccuracy}%`,
      trend: { value: "+0.2%", isPositive: true, period: "last month" },
      icon: "fas fa-brain",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <>
      <Header
        title="Security Dashboard"
        description="Real-time email security monitoring and threat prevention"
        threatLevel="low"
        alertCount={3}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ThreatFeed />
          <ModuleStatus />
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Threat Intelligence Dashboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Threat Intelligence</CardTitle>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-globe text-red-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Malicious Domains</p>
                      <p className="text-xs text-slate-600">142 new domains identified</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">+12%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-mask text-amber-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Impersonation Attempts</p>
                      <p className="text-xs text-slate-600">34 CEO impersonations blocked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">+8%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-fingerprint text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">IP Reputation</p>
                      <p className="text-xs text-slate-600">567 suspicious IPs tracked</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">+5%</span>
                </div>
              </div>

              {/* Threat Intelligence Chart Placeholder */}
              <div className="mt-6 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl text-slate-400 mb-2"></i>
                  <p className="text-sm text-slate-600">Threat Intelligence Trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ML Model Performance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ML Model Performance</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-600">All Models Healthy</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Phishing Detection Model</span>
                    <span className="text-sm font-semibold text-green-600">99.4%</span>
                  </div>
                  <Progress value={99.4} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Data Exfiltration Model</span>
                    <span className="text-sm font-semibold text-green-600">98.7%</span>
                  </div>
                  <Progress value={98.7} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Behavioral Analysis Model</span>
                    <span className="text-sm font-semibold text-amber-600">96.2%</span>
                  </div>
                  <Progress value={96.2} className="h-2 bg-amber-200" />
                </div>

                {/* Model Training Status */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Training Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Training</span>
                      <span className="text-sm font-medium text-slate-900">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Next Scheduled</span>
                      <span className="text-sm font-medium text-slate-900">In 22 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Model Version</span>
                      <span className="text-sm font-medium text-slate-900">v2.4.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy and Configuration Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Security Policies & Configuration</CardTitle>
              <PolicyModal>
                <Button className="bg-tessian-primary hover:bg-tessian-primary/90">
                  <i className="fas fa-plus mr-2"></i>
                  Create Policy
                </Button>
              </PolicyModal>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-secureflow-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-shield-check text-green-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Data Loss Prevention</h4>
                  </div>
                  <span className="tessian-status-badge active">Active</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Prevents confidential data from being sent to external recipients
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>347 rules</span>
                  <span>Updated 2 days ago</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg hover:border-secureflow-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-user-shield text-blue-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Executive Protection</h4>
                  </div>
                  <span className="tessian-status-badge active">Active</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Enhanced protection for C-level executives against targeted attacks
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>12 users</span>
                  <span>Updated 1 week ago</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg hover:border-secureflow-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-graduation-cap text-purple-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">User Training</h4>
                  </div>
                  <span className="tessian-status-badge learning">Learning</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Adaptive training based on user behavior and threat landscape
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>1,234 users</span>
                  <span>Updated 3 hours ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity & Access Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Identity & Access Management</CardTitle>
                <Button variant="ghost" size="sm">Manage Users</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-users-cog text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Active Directory Integration</p>
                      <p className="text-xs text-slate-600">8,432 users synchronized</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-key text-green-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">SSO Integration</p>
                      <p className="text-xs text-slate-600">SAML 2.0 & OAuth 2.0 enabled</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-user-shield text-purple-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Role-Based Access Control</p>
                      <p className="text-xs text-slate-600">24 roles, 156 permissions</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health & Infrastructure */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Health</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-600">All Systems Operational</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-server text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">API Response Time</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{metrics.apiResponseTime}ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-database text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Database Performance</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{metrics.databasePerformance}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-cloud text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Cloud Infrastructure</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">Healthy</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-shield-alt text-slate-600"></i>
                    <span className="text-sm font-medium text-slate-900">Security Score</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">98/100</span>
                </div>
              </div>

              {/* Resource Usage Chart Placeholder */}
              <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-area text-2xl text-slate-400 mb-1"></i>
                  <p className="text-xs text-slate-600">Resource Usage Trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}