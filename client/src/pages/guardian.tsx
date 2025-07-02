import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Guardian() {
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);
  
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

  const getStatusBadge = (status: string): "destructive" | "secondary" | "default" => {
    const variants: Record<string, "destructive" | "secondary" | "default"> = {
      blocked: "destructive",
      warned: "secondary",
      allowed: "default",
    };
    return variants[status] || "default";
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

  const handleInvestigate = (email: any) => {
    setSelectedEmail(email);
    setIsInvestigationOpen(true);
  };

  const handleBlockAndQuarantine = () => {
    if (selectedEmail) {
      alert(`Email "${selectedEmail.subject}" has been blocked and quarantined.\n\nActions taken:\n• Email moved to quarantine\n• Sender added to block list\n• Incident logged for compliance\n• Security team notified`);
    }
  };

  const handleUserTraining = () => {
    if (selectedEmail) {
      alert(`User training session initiated for ${selectedEmail.sender}\n\nTraining module:\n• Data loss prevention awareness\n• External recipient verification\n• Confidential data handling\n• Company security policies`);
    }
  };

  const handleCreateAlert = () => {
    if (selectedEmail) {
      alert(`Security alert created for email ID: ${selectedEmail.id}\n\nAlert details:\n• High-priority incident\n• Assigned to security team\n• Escalation rules applied\n• Notification sent to administrators`);
    }
  };

  const handleExportReport = () => {
    if (selectedEmail) {
      alert(`Investigation report exported for email ID: ${selectedEmail.id}\n\nReport includes:\n• Complete threat analysis\n• Risk assessment details\n• Recommended actions\n• Compliance documentation\n\nReport saved to: SecurityReports/Investigation_${selectedEmail.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const handleSaveInvestigation = () => {
    if (selectedEmail) {
      alert(`Investigation saved for email ID: ${selectedEmail.id}\n\nSaved data:\n• Analysis results\n• Investigation notes\n• Action history\n• Timestamp: ${new Date().toLocaleString()}\n\nInvestigation can be referenced for future incidents.`);
      setIsInvestigationOpen(false);
    }
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
                            <Badge variant={getStatusBadge(email.status) as any}>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleInvestigate(email)}
                          >
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

      {/* Professional Investigation Modal */}
      <Dialog open={isInvestigationOpen} onOpenChange={setIsInvestigationOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-search text-white"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Email Security Investigation</h3>
                <p className="text-sm text-slate-600">Detailed analysis and threat assessment</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-6">
              {/* Header Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Email Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Subject:</span> {selectedEmail.subject}</div>
                      <div><span className="font-medium">From:</span> {selectedEmail.sender}</div>
                      <div><span className="font-medium">To:</span> {selectedEmail.recipient}</div>
                      <div><span className="font-medium">Timestamp:</span> {formatTimeAgo(selectedEmail.timestamp)}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusBadge(selectedEmail.status) as any}>
                          {selectedEmail.status.toUpperCase()}
                        </Badge>
                        <span className={`text-sm font-bold ${getRiskColor(selectedEmail.riskScore)}`}>
                          {(selectedEmail.riskScore * 100).toFixed(0)}% Risk Score
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{selectedEmail.reason}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Investigation Tabs */}
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="recipients">Recipients</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Threat Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold mb-3">Detection Triggers</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-exclamation-triangle text-red-500"></i>
                              <span className="text-sm">External competitor recipient</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-file-alt text-amber-500"></i>
                              <span className="text-sm">Contains confidential keywords</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-shield-alt text-red-500"></i>
                              <span className="text-sm">Policy violation detected</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-3">Risk Factors</h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Recipient trust level</span>
                              <div className="w-24 bg-red-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Content sensitivity</span>
                              <div className="w-24 bg-red-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: '95%'}}></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Historical patterns</span>
                              <div className="w-24 bg-amber-200 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{width: '70%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Classification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Detected Data Types</h5>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="destructive">Financial Data</Badge>
                            <Badge variant="destructive">Confidential Reports</Badge>
                            <Badge variant="secondary">Business Strategy</Badge>
                            <Badge variant="secondary">Revenue Information</Badge>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h5 className="font-semibold mb-2">Email Preview</h5>
                          <div className="bg-slate-100 rounded-lg p-4 border">
                            <div className="text-sm space-y-2">
                              <div><strong>Subject:</strong> {selectedEmail.subject}</div>
                              <div><strong>Content Preview:</strong></div>
                              <div className="bg-white p-3 rounded border italic text-slate-700">
                                "Please find attached our Q4 financial performance report including revenue projections, 
                                profit margins, and strategic initiatives for the upcoming year. This document contains 
                                highly sensitive information regarding our competitive position..."
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recipients" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recipient Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold mb-2">Primary Recipient</h5>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <i className="fas fa-building text-red-500"></i>
                                <span className="font-medium">{selectedEmail.recipient}</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <div><strong>Organization:</strong> Rival Corp</div>
                                <div><strong>Relationship:</strong> External Competitor</div>
                                <div><strong>Trust Level:</strong> <span className="text-red-600 font-medium">Untrusted</span></div>
                                <div><strong>Previous Interactions:</strong> 0 emails</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-2">Verification Status</h5>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-times-circle text-red-500"></i>
                                <span className="text-sm">Domain not in allow list</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-times-circle text-red-500"></i>
                                <span className="text-sm">Recipient not verified</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-times-circle text-red-500"></i>
                                <span className="text-sm">Flagged as competitor</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button variant="destructive" className="h-16 flex-col" onClick={handleBlockAndQuarantine}>
                            <i className="fas fa-ban mb-1"></i>
                            Block & Quarantine
                          </Button>
                          <Button variant="outline" className="h-16 flex-col" onClick={handleUserTraining}>
                            <i className="fas fa-user-graduate mb-1"></i>
                            User Training
                          </Button>
                          <Button variant="outline" className="h-16 flex-col" onClick={handleCreateAlert}>
                            <i className="fas fa-bell mb-1"></i>
                            Create Alert
                          </Button>
                          <Button variant="outline" className="h-16 flex-col" onClick={handleExportReport}>
                            <i className="fas fa-file-export mb-1"></i>
                            Export Report
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h5 className="font-semibold mb-2">Investigation Notes</h5>
                          <textarea 
                            className="w-full h-24 p-3 border rounded-lg resize-none"
                            placeholder="Add investigation notes, decision rationale, or follow-up actions..."
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsInvestigationOpen(false)}>
                            Close Investigation
                          </Button>
                          <Button onClick={handleSaveInvestigation}>
                            <i className="fas fa-save mr-2"></i>
                            Save Investigation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
