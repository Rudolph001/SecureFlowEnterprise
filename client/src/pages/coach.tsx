import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Coach() {
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const coachMetrics = [
    {
      title: "Users Trained",
      value: "1,234",
      trend: { value: "+15%", isPositive: true, period: "last month" },
      icon: "fas fa-graduation-cap",
      iconColor: "text-blue-600",
    },
    {
      title: "Training Completion",
      value: "87%",
      trend: { value: "+5%", isPositive: true, period: "last month" },
      icon: "fas fa-check-circle",
      iconColor: "text-green-600",
    },
    {
      title: "Incidents Prevented",
      value: "89",
      trend: { value: "+12%", isPositive: true, period: "post-training" },
      icon: "fas fa-shield-check",
      iconColor: "text-purple-600",
    },
    {
      title: "Knowledge Score",
      value: "8.4/10",
      trend: { value: "+0.3", isPositive: true, period: "average" },
      icon: "fas fa-brain",
      iconColor: "text-amber-600",
    },
  ];

  const mockTrainingEvents = [
    {
      id: 1,
      user: "john.doe@company.com",
      module: "Phishing Awareness",
      trigger: "Clicked suspicious link",
      score: 85,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: "completed",
      improvement: "Good understanding of phishing indicators",
    },
    {
      id: 2,
      user: "sarah.smith@company.com",
      module: "Data Classification",
      trigger: "Attempted to send confidential data",
      score: 92,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: "completed",
      improvement: "Excellent grasp of data sensitivity levels",
    },
    {
      id: 3,
      user: "mike.johnson@company.com",
      module: "Social Engineering",
      trigger: "Responded to CEO impersonation",
      score: 78,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: "in_progress",
      improvement: "Needs review of verification procedures",
    },
  ];

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      failed: "destructive",
    };
    return variants[status] || "default";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const handleViewDetails = (training: any) => {
    setSelectedTraining(training);
    setIsDetailsOpen(true);
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
        title="Coach Module"
        description="User coaching system and incident response workflows with adaptive training"
        threatLevel="low"
        alertCount={2}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {coachMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Training Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Training Activities</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Adaptive Learning</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockTrainingEvents.map((event) => (
                    <div key={event.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getStatusBadge(event.status)}>
                              {event.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className={`text-sm font-medium ${getScoreColor(event.score)}`}>
                              Score: {event.score}/100
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">{event.module}</h4>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">User:</span> {event.user}
                          </p>
                          <p className="text-sm text-slate-500 mb-2">
                            <span className="font-medium">Trigger:</span> {event.trigger}
                          </p>
                          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            {event.improvement}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-slate-500">{formatTimeAgo(event.timestamp)}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(event)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Coaching Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Coaching Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adaptive-training">Adaptive Training</Label>
                  <Switch id="adaptive-training" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="instant-coaching">Instant Coaching</Label>
                  <Switch id="instant-coaching" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="personalized-content">Personalized Content</Label>
                  <Switch id="personalized-content" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="progress-tracking">Progress Tracking</Label>
                  <Switch id="progress-tracking" defaultChecked />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Training Modules</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Phishing Awareness</span>
                    <span className="text-sm font-medium text-green-600">92% completion</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Data Security</span>
                    <span className="text-sm font-medium text-blue-600">87% completion</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Social Engineering</span>
                    <span className="text-sm font-medium text-amber-600">78% completion</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Incident Response</span>
                    <span className="text-sm font-medium text-purple-600">65% completion</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-play mr-2"></i>
                Launch Training
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Training Analytics and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall Completion Rate</span>
                    <span className="text-sm font-semibold text-green-600">87%</span>
                  </div>
                  <Progress value={87} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">1,234</p>
                    <p className="text-xs text-green-700">Users Trained</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">8.4</p>
                    <p className="text-xs text-blue-700">Avg Score</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">89</p>
                    <p className="text-xs text-purple-700">Incidents Prevented</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-900">15</p>
                    <p className="text-xs text-amber-700">Avg Duration (min)</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Department Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Engineering</span>
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Sales</span>
                      <span className="text-sm font-medium text-blue-600">89%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Marketing</span>
                      <span className="text-sm font-medium text-amber-600">82%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Finance</span>
                      <span className="text-sm font-medium text-purple-600">91%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-lightbulb text-blue-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Most Effective Training</h4>
                  </div>
                  <p className="text-sm text-slate-600">Interactive phishing simulations</p>
                  <p className="text-xs text-slate-500">95% knowledge retention after 30 days</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-exclamation-triangle text-amber-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Common Weaknesses</h4>
                  </div>
                  <p className="text-sm text-slate-600">Business Email Compromise recognition</p>
                  <p className="text-xs text-slate-500">23% still vulnerable to CEO fraud</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-trophy text-green-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Top Performers</h4>
                  </div>
                  <p className="text-sm text-slate-600">Engineering & Finance teams</p>
                  <p className="text-xs text-slate-500">Consistently score above 90%</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-chart-line text-purple-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Improvement Trend</h4>
                  </div>
                  <p className="text-sm text-slate-600">15% reduction in security incidents</p>
                  <p className="text-xs text-slate-500">Since implementing coaching program</p>
                </div>
              </div>

              <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-line text-2xl text-slate-400 mb-1"></i>
                  <p className="text-xs text-slate-600">Learning Progress Trends</p>
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline">
                <i className="fas fa-download mr-2"></i>
                Export Training Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Professional Training Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Training Session Details</h3>
                <p className="text-sm text-slate-600">Comprehensive learning analytics and performance review</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTraining && (
            <div className="space-y-6">
              {/* Header Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Training Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Module:</span> {selectedTraining.module}</div>
                      <div><span className="font-medium">User:</span> {selectedTraining.user}</div>
                      <div><span className="font-medium">Trigger Event:</span> {selectedTraining.trigger}</div>
                      <div><span className="font-medium">Completed:</span> {formatTimeAgo(selectedTraining.timestamp)}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Performance Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusBadge(selectedTraining.status) as any}>
                          {selectedTraining.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className={`text-sm font-bold ${getScoreColor(selectedTraining.score)}`}>
                          {selectedTraining.score}/100 Score
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${selectedTraining.score >= 90 ? 'bg-green-500' : selectedTraining.score >= 80 ? 'bg-blue-500' : selectedTraining.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{width: `${selectedTraining.score}%`}}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-600">{selectedTraining.improvement}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Training Analysis */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="recommendations">Next Steps</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Training Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold mb-3">Learning Objectives</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check-circle text-green-500"></i>
                              <span className="text-sm">Identify phishing indicators</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check-circle text-green-500"></i>
                              <span className="text-sm">Verify sender authenticity</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check-circle text-green-500"></i>
                              <span className="text-sm">Report suspicious emails</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-3">Training Metrics</h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Time to Complete</span>
                              <span className="text-sm font-medium">12 minutes</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Questions Answered</span>
                              <span className="text-sm font-medium">8/10 correct</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Attempts Required</span>
                              <span className="text-sm font-medium">1 (first try)</span>
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
                      <CardTitle className="text-lg">Training Content Covered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Module Sections</h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-check-circle text-green-600"></i>
                                <span className="text-sm">Introduction to Phishing</span>
                              </div>
                              <span className="text-xs text-green-700">Completed</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-check-circle text-green-600"></i>
                                <span className="text-sm">Common Attack Vectors</span>
                              </div>
                              <span className="text-xs text-green-700">Completed</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-check-circle text-green-600"></i>
                                <span className="text-sm">Real-world Examples</span>
                              </div>
                              <span className="text-xs text-green-700">Completed</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded">
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-exclamation-triangle text-amber-600"></i>
                                <span className="text-sm">Interactive Simulation</span>
                              </div>
                              <span className="text-xs text-amber-700">Needs Review</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{selectedTraining.score}</div>
                            <div className="text-sm text-slate-600">Overall Score</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">95%</div>
                            <div className="text-sm text-slate-600">Comprehension</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">A-</div>
                            <div className="text-sm text-slate-600">Grade</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h5 className="font-semibold mb-3">Areas of Strength</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-star text-yellow-500"></i>
                              <span className="text-sm">Excellent recognition of sender spoofing</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-star text-yellow-500"></i>
                              <span className="text-sm">Quick identification of suspicious links</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-star text-yellow-500"></i>
                              <span className="text-sm">Proper reporting procedures followed</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-3">Improvement Areas</h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-flag text-amber-500"></i>
                              <span className="text-sm">Social engineering emotional triggers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-flag text-amber-500"></i>
                              <span className="text-sm">Verification of urgent requests</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button variant="default" className="h-16 flex-col">
                            <i className="fas fa-graduation-cap mb-1"></i>
                            Advanced Training Module
                          </Button>
                          <Button variant="outline" className="h-16 flex-col">
                            <i className="fas fa-redo mb-1"></i>
                            Retake Simulation
                          </Button>
                          <Button variant="outline" className="h-16 flex-col">
                            <i className="fas fa-users mb-1"></i>
                            Team Discussion
                          </Button>
                          <Button variant="outline" className="h-16 flex-col">
                            <i className="fas fa-calendar mb-1"></i>
                            Schedule Follow-up
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h5 className="font-semibold mb-2">Personalized Learning Path</h5>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm space-y-2">
                              <div><strong>Next Module:</strong> Advanced Social Engineering Defense</div>
                              <div><strong>Recommended Timing:</strong> 1 week</div>
                              <div><strong>Focus Areas:</strong> CEO fraud, wire transfer requests, emotional manipulation</div>
                              <div><strong>Expected Duration:</strong> 15-20 minutes</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                            Close Details
                          </Button>
                          <Button onClick={() => {
                            toast({
                              title: "📚 Learning Path Updated",
                              description: `Personalized training schedule created for ${selectedTraining.user}. Next module scheduled for next week.`,
                              duration: 4000,
                            });
                            setIsDetailsOpen(false);
                          }}>
                            <i className="fas fa-save mr-2"></i>
                            Update Learning Path
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
