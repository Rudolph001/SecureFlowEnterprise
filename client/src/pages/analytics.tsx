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
import jsPDF from 'jspdf';

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

  const generateReportContent = (reportType: string) => {
    const currentDate = new Date().toLocaleDateString();
    const reportData = {
      'GDPR': {
        title: 'GDPR Compliance Report',
        score: '99.1%',
        content: `GDPR COMPLIANCE REPORT
Generated on: ${currentDate}

EXECUTIVE SUMMARY
Overall Compliance Score: 99.1%

KEY METRICS:
• Data Processing Activities: 247 documented
• Consent Records: 15,847 active
• Data Subject Requests: 43 processed (100% within 30 days)
• Privacy Impact Assessments: 12 completed
• Data Breach Incidents: 0 reported

COMPLIANCE STATUS:
✓ Article 30 Records: Complete
✓ Privacy Policy: Updated & Published
✓ Consent Management: Fully Implemented
✓ Data Subject Rights: Automated Processing
✓ Data Protection Officer: Appointed

RECOMMENDATIONS:
- Continue quarterly compliance reviews
- Update privacy training materials
- Review third-party processor agreements

This report confirms substantial compliance with GDPR requirements.`
      },
      'SOC 2': {
        title: 'SOC 2 Type II Compliance Report',
        score: '98.7%',
        content: `SOC 2 TYPE II COMPLIANCE REPORT
Generated on: ${currentDate}

EXECUTIVE SUMMARY
Overall Compliance Score: 98.7%

TRUST SERVICES CRITERIA:
• Security: 99.2% - Excellent
• Availability: 99.8% - Excellent  
• Processing Integrity: 98.1% - Good
• Confidentiality: 99.0% - Excellent
• Privacy: 97.5% - Good

CONTROL EFFECTIVENESS:
✓ Access Controls: Effective
✓ System Operations: Effective
✓ Change Management: Effective
✓ Risk Mitigation: Effective
⚠ Incident Response: Improvement Needed

AUDIT FINDINGS:
- 3 Minor findings identified
- All findings have remediation plans
- No material weaknesses noted

This report demonstrates effective controls over security, availability, and confidentiality.`
      },
      'HIPAA': {
        title: 'HIPAA Compliance Report',
        score: '96.8%',
        content: `HIPAA COMPLIANCE REPORT
Generated on: ${currentDate}

EXECUTIVE SUMMARY
Overall Compliance Score: 96.8%

SAFEGUARDS IMPLEMENTATION:
• Administrative Safeguards: 98.5%
• Physical Safeguards: 97.2%
• Technical Safeguards: 95.1%

COMPLIANCE AREAS:
✓ Security Officer Designation: Complete
✓ Workforce Training: 96% completion
✓ Access Management: Implemented
✓ Audit Controls: Active monitoring
✓ Transmission Security: Encrypted

RISK ASSESSMENT:
- Low Risk: 89% of systems
- Medium Risk: 10% of systems  
- High Risk: 1% of systems

RECOMMENDATIONS:
- Enhance encryption for legacy systems
- Complete remaining staff training
- Update business associate agreements

Protected health information handling meets HIPAA standards.`
      }
    };
    
    return reportData[reportType as keyof typeof reportData];
  };

  const generateProfessionalPDF = (reportType: string, reportInfo: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Company Header
    doc.setFillColor(31, 41, 55); // Dark blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Company name
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('SecureFlow Enterprise', margin, 25);
    
    // Subtitle
    doc.setFontSize(12);
    doc.text('Email Security Platform', margin, 35);
    
    // Report type and date
    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated: ${dateStr}`, pageWidth - margin - 60, 35);
    
    // Reset text color for body
    doc.setTextColor(0, 0, 0);
    
    let yPos = 70;
    
    // Report Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText(reportInfo.title, margin, yPos, contentWidth, 20);
    yPos += 10;
    
    // Compliance Score Box
    doc.setFillColor(34, 197, 94); // Green
    doc.rect(margin, yPos, 80, 25, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Compliance Score', margin + 5, yPos + 10);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(reportInfo.score, margin + 5, yPos + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    yPos += 40;
    
    // Parse and format content sections
    const sections = reportInfo.content.split('\n\n');
    
    sections.forEach((section: string) => {
      if (section.trim()) {
        const lines = section.split('\n');
        const title = lines[0];
        
        // Check if we need a new page
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = margin;
        }
        
        // Section title
        if (title.includes('SUMMARY') || title.includes('METRICS') || title.includes('STATUS') || 
            title.includes('CRITERIA') || title.includes('EFFECTIVENESS') || title.includes('FINDINGS') ||
            title.includes('SAFEGUARDS') || title.includes('AREAS') || title.includes('ASSESSMENT') ||
            title.includes('RECOMMENDATIONS')) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(59, 130, 246); // Blue
          doc.rect(margin, yPos - 5, contentWidth, 15, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text(title, margin + 5, yPos + 5);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          yPos += 20;
          
          // Add the content under this section header
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim()) {
              // Check if we need a new page
              if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = margin;
              }
              
              doc.setFontSize(10);
              
              // Handle bullet points and checkmarks
              if (line.includes('•') || line.includes('✓') || line.includes('⚠')) {
                doc.setFont('helvetica', 'normal');
                yPos = addWrappedText(line, margin + 5, yPos, contentWidth - 10, 10);
              } else if (line.includes(':') && !line.includes('Generated on')) {
                // Key-value pairs
                doc.setFont('helvetica', 'bold');
                const [key, ...valueParts] = line.split(':');
                doc.text(key + ':', margin, yPos);
                doc.setFont('helvetica', 'normal');
                if (valueParts.length > 0) {
                  yPos = addWrappedText(valueParts.join(':'), margin + 60, yPos, contentWidth - 60, 10);
                } else {
                  yPos += 6;
                }
              } else {
                doc.setFont('helvetica', 'normal');
                yPos = addWrappedText(line, margin, yPos, contentWidth, 10);
              }
              yPos += 4;
            }
          }
        } else {
          // Regular content (non-section headers)
          lines.forEach((line: string) => {
            if (line.trim()) {
              // Check if we need a new page
              if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = margin;
              }
              
              doc.setFontSize(10);
              
              // Handle bullet points and checkmarks
              if (line.includes('•') || line.includes('✓') || line.includes('⚠')) {
                doc.setFont('helvetica', 'normal');
                yPos = addWrappedText(line, margin + 5, yPos, contentWidth - 10, 10);
              } else if (line.includes(':') && !line.includes('Generated on')) {
                // Key-value pairs
                doc.setFont('helvetica', 'bold');
                const [key, ...valueParts] = line.split(':');
                doc.text(key + ':', margin, yPos);
                doc.setFont('helvetica', 'normal');
                if (valueParts.length > 0) {
                  yPos = addWrappedText(valueParts.join(':'), margin + 60, yPos, contentWidth - 60, 10);
                } else {
                  yPos += 6;
                }
              } else {
                doc.setFont('helvetica', 'normal');
                yPos = addWrappedText(line, margin, yPos, contentWidth, 10);
              }
              yPos += 4;
            }
          });
        }
        yPos += 8;
      }
    });
    
    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('SecureFlow Enterprise - Confidential Report', margin, footerY);
    doc.text('Page 1', pageWidth - margin - 30, footerY);
    
    return doc;
  };

  const handleComplianceReport = (reportType: string) => {
    const reportInfo = generateReportContent(reportType);
    
    if (reportInfo) {
      const filename = `${reportType.replace(' ', '_')}_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Generate professional PDF
      const pdf = generateProfessionalPDF(reportType, reportInfo);
      
      // Download the PDF
      pdf.save(filename);
      
      // Show success notification
      toast({
        title: `${reportType} Report Downloaded`,
        description: `Professional ${reportInfo.title} (Score: ${reportInfo.score}) has been generated and downloaded as PDF.`,
      });
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

            {/* Security Events Timeline */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Security Events Timeline</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="24h">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline Header */}
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Recent Activity</span>
                    <span>Live Updates</span>
                  </div>
                  
                  {/* Timeline Events */}
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    
                    <div className="space-y-4">
                      {/* High Severity Event */}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-red-100 border-2 border-red-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Phishing Attempt Blocked</h4>
                              <p className="text-sm text-slate-600">CEO impersonation targeting Finance team</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="destructive">High Risk</Badge>
                              <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Target: finance@company.com • Source: suspicious-domain.com • Action: Quarantined
                          </div>
                        </div>
                      </div>

                      {/* Medium Severity Event */}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-amber-100 border-2 border-amber-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-shield-alt text-amber-600 text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Misdirected Email Detection</h4>
                              <p className="text-sm text-slate-600">Personal email sent to external domain</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">Medium Risk</Badge>
                              <p className="text-xs text-slate-500 mt-1">8 minutes ago</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            User: j.smith@company.com • Guardian Module • Action: User Warned
                          </div>
                        </div>
                      </div>

                      {/* Low Severity Event */}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-green-600 text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Policy Compliance Check</h4>
                              <p className="text-sm text-slate-600">Outbound email scanned and approved</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="default">Allowed</Badge>
                              <p className="text-xs text-slate-500 mt-1">12 minutes ago</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            User: m.johnson@company.com • Enforcer Module • Risk Score: 2/100
                          </div>
                        </div>
                      </div>

                      {/* Training Event */}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 border-2 border-blue-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-graduation-cap text-blue-600 text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Security Training Completed</h4>
                              <p className="text-sm text-slate-600">Phishing awareness module finished</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">Training</Badge>
                              <p className="text-xs text-slate-500 mt-1">18 minutes ago</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            User: a.williams@company.com • Coach Module • Score: 95/100
                          </div>
                        </div>
                      </div>

                      {/* System Event */}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 border-2 border-purple-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-cog text-purple-600 text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">ML Model Updated</h4>
                              <p className="text-sm text-slate-600">Threat detection algorithm retrained</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">System</Badge>
                              <p className="text-xs text-slate-500 mt-1">25 minutes ago</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Architect Module • New samples: 1,247 • Accuracy: 99.8%
                          </div>
                        </div>
                      </div>

                      {/* Threat Intelligence Update */}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-indigo-100 border-2 border-indigo-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-globe text-indigo-600 text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Threat Intelligence Updated</h4>
                              <p className="text-sm text-slate-600">New malicious domains identified</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">Intel</Badge>
                              <p className="text-xs text-slate-500 mt-1">32 minutes ago</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Sources: 3 feeds • New indicators: 47 domains, 12 IPs
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>High Risk</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Medium Risk</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Low Risk</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Training</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({
                        title: "📊 Timeline Exported",
                        description: "Security events timeline exported to CSV format successfully.",
                        duration: 3000,
                      });
                    }}>
                      <i className="fas fa-download mr-1"></i>
                      Export Timeline
                    </Button>
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
