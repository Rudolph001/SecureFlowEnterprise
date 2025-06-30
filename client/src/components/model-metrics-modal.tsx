
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ModelMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: any;
}

export default function ModelMetricsModal({ open, onOpenChange, model }: ModelMetricsModalProps) {
  if (!model) return null;

  const getPerformanceColor = (value: number) => {
    if (value >= 95) return "text-green-600";
    if (value >= 90) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className={`fas fa-chart-line text-blue-600`}></i>
            <span>Model Metrics - {model.name}</span>
            <Badge variant="outline">{model.version}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className={`text-sm font-bold ${getPerformanceColor((model.accuracy || 0) * 100)}`}>
                    {((model.accuracy || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(model.accuracy || 0) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Precision</span>
                  <span className="text-sm font-bold text-green-600">98.7%</span>
                </div>
                <Progress value={98.7} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Recall</span>
                  <span className="text-sm font-bold text-blue-600">96.4%</span>
                </div>
                <Progress value={96.4} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">F1 Score</span>
                  <span className="text-sm font-bold text-purple-600">97.5%</span>
                </div>
                <Progress value={97.5} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">AUC-ROC</span>
                  <span className="text-sm font-bold text-amber-600">0.994</span>
                </div>
                <Progress value={99.4} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Operational Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">12ms</p>
                  <p className="text-xs text-blue-700">Avg Inference Time</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">2.3K</p>
                  <p className="text-xs text-green-700">Requests/sec</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-900">99.9%</p>
                  <p className="text-xs text-purple-700">Uptime</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-900">67%</p>
                  <p className="text-xs text-amber-700">CPU Usage</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Memory Usage</span>
                  <span className="text-sm font-medium text-blue-600">2.1GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">GPU Utilization</span>
                  <span className="text-sm font-medium text-purple-600">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Error Rate</span>
                  <span className="text-sm font-medium text-red-600">0.01%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Data Processed</span>
                  <span className="text-sm font-medium text-green-600">2.4M emails</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training History */}
          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-900">v{model.version}</p>
                    <p className="text-xs text-green-700">Current Version</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-900">14h</p>
                    <p className="text-xs text-blue-700">Training Duration</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Training Progress</div>
                  <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-chart-line text-2xl text-slate-400 mb-1"></i>
                      <p className="text-xs text-slate-600">Loss Curves & Accuracy Graph</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Dataset Size:</span>
                    <span className="font-medium">2.4M samples</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Training Split:</span>
                    <span className="font-medium">80/10/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Epochs:</span>
                    <span className="font-medium">50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Learning Rate:</span>
                    <span className="font-medium">0.001</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detection Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">Threats Detected</p>
                      <p className="text-xs text-red-700">Last 24 hours</p>
                    </div>
                    <p className="text-xl font-bold text-red-900">147</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-amber-900">False Positives</p>
                      <p className="text-xs text-amber-700">Last 24 hours</p>
                    </div>
                    <p className="text-xl font-bold text-amber-900">3</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-900">Emails Processed</p>
                      <p className="text-xs text-green-700">Last 24 hours</p>
                    </div>
                    <p className="text-xl font-bold text-green-900">15.2K</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Detection Categories</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Phishing</span>
                      <span className="text-sm font-medium">89 (60.5%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Malware</span>
                      <span className="text-sm font-medium">31 (21.1%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Spam</span>
                      <span className="text-sm font-medium">19 (12.9%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Impersonation</span>
                      <span className="text-sm font-medium">8 (5.4%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
