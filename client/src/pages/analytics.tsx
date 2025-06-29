import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Analytics() {
  const { toast } = useToast();
  
  const { data: dashboardMetrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  const { data: emailEvents } = useQuery({
    queryKey: ['/api/email-events'],
  });

  const { data: threatIntelligence } = useQuery({
    queryKey: ['/api/threat-intelligence'],
  });

  const handleComplianceReport = (reportType: string) => {
    const reportData = {
      'GDPR': {
        fileName: 'GDPR_Compliance_Report.pdf',
        description: 'General Data Protection Regulation compliance report',
        score: '99.1%'
      },
      'SOC 2': {
        fileName: 'SOC2_Compliance_Report.pdf',
        description: 'SOC 2 Type II compliance audit report',
        score: '98.7%'
      },
      'HIPAA': {
        fileName: 'HIPAA_Compliance_Report.pdf',
        description: 'Health Insurance Portability and Accountability Act compliance report',
        score: '96.8%'
      }
    };

    const report = reportData[reportType as keyof typeof reportData];
    
    if (report) {
      // Simulate report download
      toast({
        title: `${reportType} Report Generated`,
        description: `${report.description} (Score: ${report.score}) has been generated and downloaded as ${report.fileName}`,
      });
      
      // In a real application, this would trigger an actual file download
      console.log(`Generating ${reportType} report:`, report);
    }
  };

  const analyticsMetrics = [
    {
      title: "Total Security Events",
      value: "15,247",
      trend: { value: "+12%", isPositive: true, period: "last month" },
      icon: "fas fa-shield-alt",
      iconColor: "text-blue-600",
    },
    {
      title: "Threat Prevention Rate",
      value: "99.7%",
      trend: { value: "+0.3%", isPositive: true, period: "last quarter" },
      icon: "fas fa-check-circle",
      iconColor: "text-green-600",
    },
    {
      title: "False Positive Rate",
      value: "0.3%",
      trend: { value: "-0.1%", isPositive: true, period: "last month" },
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-amber-600",
    },
    {
      title: "Risk Score Reduction",
      value: "87%",
      trend: { value: "+15%", isPositive: true, period: "since deployment" },
      icon: "fas fa-trending-down",
      iconColor: "text-purple-600",
    },
  ];

  const departmentData = [
    { name: "Engineering", users: 245, riskScore: 23, threatsBlocked: 89, compliance: 98 },
    { name: "Sales", users: 156, riskScore: 45, threatsBlocked: 134, compliance: 94 },
    { name: "Marketing", users: 87, riskScore: 38, threatsBlocked: 67, compliance: 91 },
    { name: "Finance", users: 34, riskScore: 12, threatsBlocked: 23, compliance: 99 },
    { name: "HR", users: 28, riskScore: 15, threatsBlocked: 12, compliance: 97 },
  ];

  const threatTrends = [
    { type: "Phishing", current: 67, previous: 89, change: -24.7 },
    { type: "Malware", current: 23, previous: 31, change: -25.8 },
    { type: "Data Exfiltration", current: 12, previous: 8, change: 50.0 },
    { type: "Impersonation", current: 34, previous: 45, change: -24.4 },
    { type: "Spam", current: 234, previous: 267, change: -12.4 },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-amber-600";
    if (score >= 20) return "text-blue-600";
    return "text-green-600";
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return "bg-red-50";
    if (score >= 40) return "bg-amber-50";
    if (score >= 20) return "bg-blue-50";
    return "bg-green-50";
  };

  const formatChange = (change: number) => {
    const prefix = change > 0 ? "+" : "";
    return `${prefix}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number, isGoodWhenLower = true) => {
    const isPositive = isGoodWhenLower ? change < 0 : change > 0;
    return isPositive ? "text-green-600" : "text-red-600";
  };

  return (
    <>
      <Header
        title="Security Analytics"
        description="Comprehensive usage analytics, telemetry, and licensing management with enterprise reporting"
        threatLevel="low"
        alertCount={0}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
              <TabsTrigger value="users">User Behavior</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Select defaultValue="30d">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <i className="fas fa-download mr-2"></i>
                Export Report
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-900">99.7%</p>
                        <p className="text-sm text-green-700">Protection Rate</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900">15,247</p>
                        <p className="text-sm text-blue-700">Events Processed</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-900">1,247</p>
                        <p className="text-sm text-red-700">Threats Blocked</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-900">45</p>
                        <p className="text-sm text-amber-700">False Positives</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Guardian Module</span>
                          <span className="font-medium">99.4% accuracy</span>
                        </div>
                        <Progress value={99.4} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Enforcer Module</span>
                          <span className="font-medium">98.7% accuracy</span>
                        </div>
                        <Progress value={98.7} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Defender Module</span>
                          <span className="font-medium">99.7% accuracy</span>
                        </div>
                        <Progress value={99.7} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Department Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentData.map((dept) => (
                      <div key={dept.name} className={`p-4 rounded-lg ${getRiskBg(dept.riskScore)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{dept.name}</h4>
                          <Badge variant="outline" className={getRiskColor(dept.riskScore)}>
                            Risk: {dept.riskScore}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Users</p>
                            <p className="font-medium">{dept.users}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Threats Blocked</p>
                            <p className="font-medium">{dept.threatsBlocked}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Compliance</p>
                            <p className="font-medium text-green-600">{dept.compliance}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Security Events Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-chart-line text-4xl text-slate-400 mb-2"></i>
                    <p className="text-sm text-slate-600">Security Events Over Time</p>
                    <p className="text-xs text-slate-500">Interactive timeline visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Threat Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Threat Type Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threatTrends.map((threat) => (
                      <div key={threat.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-shield-alt text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{threat.type}</p>
                            <p className="text-sm text-slate-600">{threat.current} incidents</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getChangeColor(threat.change)}`}>
                            {formatChange(threat.change)}
                          </p>
                          <p className="text-xs text-slate-500">vs last period</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Threat Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Threat Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-globe text-red-600"></i>
                        <div>
                          <p className="font-medium text-slate-900">External Domains</p>
                          <p className="text-sm text-slate-600">1,247 malicious domains</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-red-600">+12%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-envelope text-amber-600"></i>
                        <div>
                          <p className="font-medium text-slate-900">Suspicious Emails</p>
                          <p className="text-sm text-slate-600">567 flagged addresses</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-amber-600">+8%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-fingerprint text-blue-600"></i>
                        <div>
                          <p className="font-medium text-slate-900">IP Addresses</p>
                          <p className="text-sm text-slate-600">234 blacklisted IPs</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">+5%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-file-code text-purple-600"></i>
                        <div>
                          <p className="font-medium text-slate-900">Malware Hashes</p>
                          <p className="text-sm text-slate-600">89 unique signatures</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-purple-600">+3%</span>
                    </div>
                  </div>

                  <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-map text-2xl text-slate-400 mb-1"></i>
                      <p className="text-xs text-slate-600">Threat Geography Map</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attack Vectors */}
            <Card>
              <CardHeader>
                <CardTitle>Attack Vector Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <i className="fas fa-fish text-3xl text-red-600 mb-3"></i>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Phishing</h3>
                    <p className="text-2xl font-bold text-red-900">54%</p>
                    <p className="text-sm text-slate-600">of all threats</p>
                  </div>
                  <div className="text-center p-6 bg-amber-50 rounded-lg">
                    <i className="fas fa-mask text-3xl text-amber-600 mb-3"></i>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Impersonation</h3>
                    <p className="text-2xl font-bold text-amber-900">27%</p>
                    <p className="text-sm text-slate-600">of all threats</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <i className="fas fa-bug text-3xl text-purple-600 mb-3"></i>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Malware</h3>
                    <p className="text-2xl font-bold text-purple-900">19%</p>
                    <p className="text-sm text-slate-600">of all threats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Risk Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>High-Risk Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "John Smith", email: "john.smith@company.com", riskScore: 85, incidents: 12 },
                      { name: "Sarah Johnson", email: "sarah.j@company.com", riskScore: 78, incidents: 8 },
                      { name: "Mike Wilson", email: "mike.wilson@company.com", riskScore: 71, incidents: 6 },
                      { name: "Emily Davis", email: "emily.d@company.com", riskScore: 69, incidents: 5 },
                    ].map((user) => (
                      <div key={user.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-sm font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">Risk: {user.riskScore}</p>
                          <p className="text-xs text-slate-500">{user.incidents} incidents</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Behavior Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle>User Behavior Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Email Volume</h4>
                      <p className="text-sm text-slate-600">Average 47 emails per user per day</p>
                      <p className="text-xs text-slate-500">12% increase from last month</p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">External Communication</h4>
                      <p className="text-sm text-slate-600">5% of all emails sent externally</p>
                      <p className="text-xs text-slate-500">Within normal range</p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Attachment Usage</h4>
                      <p className="text-sm text-slate-600">23% of emails contain attachments</p>
                      <p className="text-xs text-slate-500">PDF most common (78%)</p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Peak Hours</h4>
                      <p className="text-sm text-slate-600">9-11 AM and 2-4 PM</p>
                      <p className="text-xs text-slate-500">87% of users follow this pattern</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Training Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Training Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-900">87%</p>
                    <p className="text-sm text-slate-600">Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-900">8.4</p>
                    <p className="text-sm text-slate-600">Average Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-900">15%</p>
                    <p className="text-sm text-slate-600">Risk Reduction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-900">89</p>
                    <p className="text-sm text-slate-600">Incidents Prevented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-green-900">98.2%</p>
                    <p className="text-slate-600">Overall Compliance Score</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>GDPR Compliance</span>
                        <span className="font-medium text-green-600">99.1%</span>
                      </div>
                      <Progress value={99.1} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>SOC 2 Compliance</span>
                        <span className="font-medium text-green-600">98.7%</span>
                      </div>
                      <Progress value={98.7} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>ISO 27001 Compliance</span>
                        <span className="font-medium text-green-600">97.3%</span>
                      </div>
                      <Progress value={97.3} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>HIPAA Compliance</span>
                        <span className="font-medium text-amber-600">96.8%</span>
                      </div>
                      <Progress value={96.8} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              <Card>
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <p className="text-sm font-medium text-slate-900">Policy Updated</p>
                      <p className="text-xs text-slate-600">Data Loss Prevention policy modified</p>
                      <p className="text-xs text-slate-500">2 hours ago • John Doe</p>
                    </div>

                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <p className="text-sm font-medium text-slate-900">User Access Granted</p>
                      <p className="text-xs text-slate-600">Security admin role assigned to Jane Smith</p>
                      <p className="text-xs text-slate-500">4 hours ago • Admin</p>
                    </div>

                    <div className="p-3 border-l-4 border-amber-500 bg-amber-50">
                      <p className="text-sm font-medium text-slate-900">Compliance Scan</p>
                      <p className="text-xs text-slate-600">Monthly compliance audit completed</p>
                      <p className="text-xs text-slate-500">1 day ago • System</p>
                    </div>

                    <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                      <p className="text-sm font-medium text-slate-900">Report Generated</p>
                      <p className="text-xs text-slate-600">GDPR compliance report exported</p>
                      <p className="text-xs text-slate-500">2 days ago • Sarah Wilson</p>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    <i className="fas fa-eye mr-2"></i>
                    View Full Audit Log
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col hover:bg-blue-50"
                    onClick={() => handleComplianceReport('GDPR')}
                  >
                    <i className="fas fa-shield-alt text-xl mb-2"></i>
                    <span>GDPR Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col hover:bg-green-50"
                    onClick={() => handleComplianceReport('SOC 2')}
                  >
                    <i className="fas fa-certificate text-xl mb-2"></i>
                    <span>SOC 2 Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col hover:bg-purple-50"
                    onClick={() => handleComplianceReport('HIPAA')}
                  >
                    <i className="fas fa-medical-file text-xl mb-2"></i>
                    <span>HIPAA Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
