
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface ModelConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: any;
  onSave: (config: any) => void;
}

export default function ModelConfigModal({ open, onOpenChange, model, onSave }: ModelConfigModalProps) {
  const [config, setConfig] = useState({
    autoScaling: true,
    confidenceThreshold: 0.85,
    maxConcurrentRequests: 1000,
    timeoutMs: 5000,
    enableLogging: true,
    enableMetrics: true,
    deploymentStrategy: "blue-green",
    retrainingFrequency: "weekly",
    alertThreshold: 0.95,
    enableDriftDetection: true,
    batchSize: 32,
    modelCaching: true,
  });

  if (!model) return null;

  const handleSave = () => {
    onSave(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className="fas fa-cog text-blue-600"></i>
            <span>Model Configuration - {model.name}</span>
            <Badge variant="outline">{model.version}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-scaling">Auto Scaling</Label>
                  <Switch
                    id="auto-scaling"
                    checked={config.autoScaling}
                    onCheckedChange={(checked) => setConfig({ ...config, autoScaling: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <div className="px-3">
                    <Slider
                      value={[config.confidenceThreshold]}
                      onValueChange={(value) => setConfig({ ...config, confidenceThreshold: value[0] })}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>{config.confidenceThreshold.toFixed(2)}</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-requests">Max Concurrent Requests</Label>
                  <Input
                    id="max-requests"
                    type="number"
                    value={config.maxConcurrentRequests}
                    onChange={(e) => setConfig({ ...config, maxConcurrentRequests: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.timeoutMs}
                    onChange={(e) => setConfig({ ...config, timeoutMs: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={config.batchSize}
                    onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="model-caching">Model Caching</Label>
                  <Switch
                    id="model-caching"
                    checked={config.modelCaching}
                    onCheckedChange={(checked) => setConfig({ ...config, modelCaching: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-logging">Enable Logging</Label>
                  <Switch
                    id="enable-logging"
                    checked={config.enableLogging}
                    onCheckedChange={(checked) => setConfig({ ...config, enableLogging: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-metrics">Enable Metrics</Label>
                  <Switch
                    id="enable-metrics"
                    checked={config.enableMetrics}
                    onCheckedChange={(checked) => setConfig({ ...config, enableMetrics: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="drift-detection">Drift Detection</Label>
                  <Switch
                    id="drift-detection"
                    checked={config.enableDriftDetection}
                    onCheckedChange={(checked) => setConfig({ ...config, enableDriftDetection: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alert Threshold</Label>
                  <div className="px-3">
                    <Slider
                      value={[config.alertThreshold]}
                      onValueChange={(value) => setConfig({ ...config, alertThreshold: value[0] })}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>{config.alertThreshold.toFixed(2)}</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Retraining Frequency</Label>
                  <Select
                    value={config.retrainingFrequency}
                    onValueChange={(value) => setConfig({ ...config, retrainingFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Deployment Strategy</Label>
                <Select
                  value={config.deploymentStrategy}
                  onValueChange={(value) => setConfig({ ...config, deploymentStrategy: value })}
                >
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
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Current Environment</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Environment</span>
                    <Badge variant="outline">Production</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Region</span>
                    <span className="text-sm font-medium">us-east-1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Replicas</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Load Balancer</span>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-shield-check text-green-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Security Status</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Model is compliant with security policies</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Last Scan: 2 hours ago</span>
                    <span className="text-green-600">✓ Passed</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-lock text-blue-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Data Encryption</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">End-to-end encryption enabled</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Algorithm: AES-256</span>
                    <span className="text-blue-600">✓ Active</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-balance-scale text-purple-600"></i>
                    <h4 className="text-sm font-semibold text-slate-900">Bias Detection</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Fairness monitoring active</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Bias Score: Low</span>
                    <span className="text-purple-600">✓ Monitoring</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
