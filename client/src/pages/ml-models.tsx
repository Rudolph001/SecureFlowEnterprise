import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/header";
import MetricsCard from "@/components/metrics-card";
import ModelMetricsModal from "@/components/model-metrics-modal";
import ModelConfigModal from "@/components/model-config-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MlModels() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const { data: mlModels, isLoading } = useQuery({
    queryKey: ['/api/ml-models'],
    refetchInterval: 30000,
  });

  const updateModelMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PUT", `/api/ml-models/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Model Updated",
        description: "ML model has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ml-models"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ML model.",
        variant: "destructive",
      });
    },
  });

  const mlMetrics = [
    {
      title: "Active Models",
      value: mlModels?.filter((m: any) => m.status === 'active').length || 0,
      trend: { value: "+1", isPositive: true, period: "this month" },
      icon: "fas fa-robot",
      iconColor: "text-blue-600",
    },
    {
      title: "Overall Accuracy",
      value: mlModels ? `${(mlModels.reduce((acc: number, m: any) => acc + (m.accuracy || 0), 0) / mlModels.length * 100).toFixed(1)}%` : "0%",
      trend: { value: "+0.3%", isPositive: true, period: "last week" },
      icon: "fas fa-bullseye",
      iconColor: "text-green-600",
    },
    {
      title: "Training Jobs",
      value: mlModels?.filter((m: any) => m.status === 'training').length || 0,
      trend: { value: "2", isPositive: false, period: "in progress" },
      icon: "fas fa-graduation-cap",
      iconColor: "text-amber-600",
    },
    {
      title: "Model Versions",
      value: mlModels?.length || 0,
      trend: { value: "+2", isPositive: true, period: "this quarter" },
      icon: "fas fa-code-branch",
      iconColor: "text-purple-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      training: "secondary",
      deprecated: "outline",
    };
    return variants[status as keyof typeof variants] || "default";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "text-green-600",
      training: "text-amber-600",
      deprecated: "text-gray-600",
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  const getModelIcon = (type: string) => {
    const icons = {
      phishing: "fas fa-fish",
      dlp: "fas fa-shield-check",
      behavioral: "fas fa-brain",
      impersonation: "fas fa-mask",
    };
    return icons[type as keyof typeof icons] || "fas fa-robot";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleModelStatus = (model: any) => {
    const newStatus = model.status === 'active' ? 'deprecated' : 'active';
    updateModelMutation.mutate({
      id: model.id,
      updates: { status: newStatus }
    });
  };

  const triggerRetraining = (model: any) => {
    updateModelMutation.mutate({
      id: model.id,
      updates: { 
        status: 'training',
        lastTrained: new Date().toISOString(),
        nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    toast({
      title: "Training Started",
      description: `Retraining initiated for ${model.name}`,
    });
  };

  const handleViewMetrics = (model: any) => {
    setSelectedModel(model);
    setMetricsModalOpen(true);
  };

  const handleConfigure = (model: any) => {
    setSelectedModel(model);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = (config: any) => {
    updateModelMutation.mutate({
      id: selectedModel.id,
      updates: { configuration: config }
    });
    toast({
      title: "Configuration Saved",
      description: `Configuration updated for ${selectedModel.name}`,
    });
  };

  const handleExportModel = (model: any) => {
    toast({
      title: "Exporting Model",
      description: `Preparing export for ${model.name}`,
    });
    // In a real app, this would trigger a model export download
    console.log('Exporting model:', model);
  };

  return (
    <>
      <Header
        title="ML Models"
        description="Production ML models for threat detection and classification with cloud-native infrastructure"
        threatLevel="low"
        alertCount={1}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mlMetrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        {/* Model Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Model List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Production Models</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Auto-scaling Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                          <div className="w-16 h-6 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  mlModels?.map((model: any) => (
                    <div key={model.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className={`${getModelIcon(model.type)} text-blue-600`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-slate-900">{model.name}</h4>
                              <Badge variant={getStatusBadge(model.status)}>
                                {model.status?.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 capitalize">{model.type} Detection Model</p>
                            <p className="text-xs text-slate-500">Version {model.version}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={model.status === 'active'}
                            onCheckedChange={() => toggleModelStatus(model)}
                            disabled={updateModelMutation.isPending}
                          />
                        </div>
                      </div>

                      {/* Model Performance */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Accuracy</span>
                            <span className={`font-medium ${model.accuracy >= 0.95 ? 'text-green-600' : model.accuracy >= 0.90 ? 'text-amber-600' : 'text-red-600'}`}>
                              {((model.accuracy || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(model.accuracy || 0) * 100} className="h-2" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Last Trained</p>
                          <p className="text-sm font-medium text-slate-900">
                            {model.lastTrained ? formatDate(model.lastTrained) : 'Never'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Next Training</p>
                          <p className="text-sm font-medium text-slate-900">
                            {model.nextTraining ? formatDate(model.nextTraining) : 'Not scheduled'}
                          </p>
                        </div>
                      </div>

                      {/* Model Actions */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => triggerRetraining(model)}
                            disabled={model.status === 'training' || updateModelMutation.isPending}
                          >
                            <i className="fas fa-play mr-1"></i>
                            {model.status === 'training' ? 'Training...' : 'Retrain'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExportModel(model)}
                          >
                            <i className="fas fa-download mr-1"></i>
                            Export
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMetrics(model)}
                          >
                            <i className="fas fa-chart-line mr-1"></i>
                            Metrics
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleConfigure(model)}
                          >
                            <i className="fas fa-cog mr-1"></i>
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Model Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Model Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-scaling">Auto-scaling</Label>
                  <Switch id="auto-scaling" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="federated-learning">Federated Learning</Label>
                  <Switch id="federated-learning" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="model-monitoring">Model Monitoring</Label>
                  <Switch id="model-monitoring" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="drift-detection">Drift Detection</Label>
                  <Switch id="drift-detection" defaultChecked />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Deployment Strategy</Label>
                <Select defaultValue="blue-green">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue-green">Blue-Green Deployment</SelectItem>
                    <SelectItem value="canary">Canary Release</SelectItem>
                    <SelectItem value="rolling">Rolling Update</SelectItem>
                    <SelectItem value="a-b">A/B Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Infrastructure</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">CPU Usage</span>
                    <span className="text-sm font-medium text-green-600">34%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Memory Usage</span>
                    <span className="text-sm font-medium text-blue-600">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">GPU Utilization</span>
                    <span className="text-sm font-medium text-purple-600">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Inference Time</span>
                    <span className="text-sm font-medium text-amber-600">12ms</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-plus mr-2"></i>
                Deploy New Model
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Model Analytics and Lifecycle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Lifecycle Management */}
          <Card>
            <CardHeader>
              <CardTitle>Model Lifecycle Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-code-branch text-blue-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Version Control</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Automated versioning with Git integration</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Latest: v2.4.1</span>
                    <span>Rollback available</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-rocket text-green-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">CI/CD Pipeline</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Automated testing and deployment</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Build: Passing</span>
                    <span>Deploy: Auto</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-chart-line text-amber-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Performance Monitoring</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Real-time metrics and alerting</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Latency: 12ms</span>
                    <span>Throughput: 2.3K/sec</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-shield-alt text-purple-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Security Scanning</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Vulnerability and bias detection</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Vulnerabilities: 0</span>
                    <span>Bias Score: Low</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training and Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Training Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">99.2%</p>
                    <p className="text-xs text-green-700">Avg Accuracy</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">2.4M</p>
                    <p className="text-xs text-blue-700">Training Samples</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">14h</p>
                    <p className="text-xs text-purple-700">Avg Training Time</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-900">0.02%</p>
                    <p className="text-xs text-amber-700">Drift Detected</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Model Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Precision</span>
                      <span className="text-sm font-medium text-green-600">98.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Recall</span>
                      <span className="text-sm font-medium text-blue-600">96.4%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">F1 Score</span>
                      <span className="text-sm font-medium text-purple-600">97.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">AUC-ROC</span>
                      <span className="text-sm font-medium text-amber-600">0.994</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-chart-area text-2xl text-slate-400 mb-1"></i>
                    <p className="text-xs text-slate-600">Training Loss Curves</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    <i className="fas fa-download mr-1"></i>
                    Export Metrics
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <i className="fas fa-chart-bar mr-1"></i>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <ModelMetricsModal
        open={metricsModalOpen}
        onOpenChange={setMetricsModalOpen}
        model={selectedModel}
      />
      
      <ModelConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        model={selectedModel}
        onSave={handleSaveConfig}
      />
    </>
  );
}
