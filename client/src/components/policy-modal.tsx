import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PolicyModalProps {
  children: React.ReactNode;
  editPolicy?: any;
  onClose?: () => void;
  isTemplate?: boolean;
}

export default function PolicyModal({ children, editPolicy, onClose, isTemplate = false }: PolicyModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "dlp",
    description: "",
    severity: "medium",
    targetUsers: { 
      groups: ["all"],
      roles: [] as string[],
      departments: [] as string[],
      specificUsers: [] as string[]
    },
    rules: {
      conditions: [] as string[],
      actions: [] as string[],
      keywords: [] as string[],
      riskThreshold: 0.7,
      priority: "normal",
      schedule: {
        enabled: false,
        days: [] as string[],
        timeRange: { start: "09:00", end: "17:00" }
      },
      exceptions: [] as string[],
      customRegex: [] as string[]
    },
    isActive: true,
    notifications: {
      enabled: true,
      recipients: [] as string[],
      escalation: false,
      channels: ["email"] as string[]
    },
    compliance: {
      framework: "",
      requirements: [] as string[]
    }
  });

  const [newCondition, setNewCondition] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newException, setNewException] = useState("");
  const [newRegex, setNewRegex] = useState("");
  const [newNotificationRecipient, setNewNotificationRecipient] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Effect to populate form when editing
  useEffect(() => {
    if (editPolicy) {
      // For template modals, only populate when dialog is open
      // For edit modals, auto-open and populate
      if (isTemplate && !open) {
        return; // Don't populate or open template modals automatically
      }

      setFormData({
        name: editPolicy.name || "",
        type: editPolicy.type || "",
        description: editPolicy.description || "",
        severity: editPolicy.severity || "medium",
        targetUsers: editPolicy.targetUsers || { 
          groups: ["all"],
          roles: [],
          departments: [],
          specificUsers: []
        },
        rules: editPolicy.rules || {
          conditions: [],
          actions: [],
          keywords: [],
          riskThreshold: 0.7,
          priority: "normal",
          schedule: {
            enabled: false,
            days: [],
            timeRange: { start: "09:00", end: "17:00" }
          },
          exceptions: [],
          customRegex: []
        },
        isActive: editPolicy.isActive !== undefined ? editPolicy.isActive : true,
        notifications: editPolicy.notifications || {
          enabled: true,
          recipients: [],
          escalation: false,
          channels: ["email"]
        },
        compliance: editPolicy.compliance || {
          framework: "",
          requirements: []
        }
      });

      // Auto-open for non-template modals (edit functionality)
      if (!isTemplate) {
        setOpen(true);
      }
    }
  }, [editPolicy, open, isTemplate]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const savePolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editPolicy) {
        return apiRequest("PUT", `/api/policies/${editPolicy.id}`, data);
      } else {
        return apiRequest("POST", "/api/policies", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editPolicy ? "Policy Updated" : "Policy Created",
        description: `Security policy has been ${editPolicy ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setOpen(false);
      resetForm();
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editPolicy ? 'update' : 'create'} policy.`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "dlp",
      description: "",
      severity: "medium",
      targetUsers: { 
        groups: ["all"],
        roles: [],
        departments: [],
        specificUsers: []
      },
      rules: {
        conditions: [],
        actions: [],
        keywords: [],
        riskThreshold: 0.7,
        priority: "normal",
        schedule: {
          enabled: false,
          days: [],
          timeRange: { start: "09:00", end: "17:00" }
        },
        exceptions: [],
        customRegex: []
      },
      isActive: true,
      notifications: {
        enabled: true,
        recipients: [],
        escalation: false,
        channels: ["email"]
      },
      compliance: {
        framework: "",
        requirements: []
      }
    });
    setNewCondition("");
    setNewAction("");
    setNewKeyword("");
    setNewException("");
    setNewRegex("");
    setNewNotificationRecipient("");
  };

  const addCondition = () => {
    if (newCondition && !formData.rules.conditions.includes(newCondition)) {
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
          conditions: [...prev.rules.conditions, newCondition]
        }
      }));
      setNewCondition("");
    }
  };

  const removeCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        conditions: prev.rules.conditions.filter(c => c !== condition)
      }
    }));
  };

  const addAction = () => {
    if (newAction && !formData.rules.actions.includes(newAction)) {
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
          actions: [...prev.rules.actions, newAction]
        }
      }));
      setNewAction("");
    }
  };

  const removeAction = (action: string) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        actions: prev.rules.actions.filter(a => a !== action)
      }
    }));
  };

  const addKeyword = () => {
    if (newKeyword && !formData.rules.keywords.includes(newKeyword)) {
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
          keywords: [...prev.rules.keywords, newKeyword]
        }
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        keywords: prev.rules.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const addException = () => {
    if (newException && !formData.rules.exceptions.includes(newException)) {
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
          exceptions: [...prev.rules.exceptions, newException]
        }
      }));
      setNewException("");
    }
  };

  const removeException = (exception: string) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        exceptions: prev.rules.exceptions.filter(e => e !== exception)
      }
    }));
  };

  const addRegex = () => {
    if (newRegex && !formData.rules.customRegex.includes(newRegex)) {
      try {
        new RegExp(newRegex); // Validate regex
        setFormData(prev => ({
          ...prev,
          rules: {
            ...prev.rules,
            customRegex: [...prev.rules.customRegex, newRegex]
          }
        }));
        setNewRegex("");
      } catch (error) {
        toast({
          title: "Invalid Regex",
          description: "Please enter a valid regular expression",
          variant: "destructive",
        });
      }
    }
  };

  const removeRegex = (regex: string) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        customRegex: prev.rules.customRegex.filter(r => r !== regex)
      }
    }));
  };

  const addNotificationRecipient = () => {
    if (newNotificationRecipient && !formData.notifications.recipients.includes(newNotificationRecipient)) {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          recipients: [...prev.notifications.recipients, newNotificationRecipient]
        }
      }));
      setNewNotificationRecipient("");
    }
  };

  const removeNotificationRecipient = (recipient: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        recipients: prev.notifications.recipients.filter(r => r !== recipient)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    savePolicyMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        onClose?.();
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPolicy ? 'Edit Security Policy' : 'Create Security Policy'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="rules">Rules & Conditions</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

          <TabsContent value="advanced" className="space-y-6">
            {/* Schedule Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule & Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.rules?.schedule?.enabled || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      rules: {
                        ...prev.rules,
                        schedule: { 
                          ...prev.rules?.schedule,
                          enabled: checked,
                          days: prev.rules?.schedule?.days || [],
                          timeRange: prev.rules?.schedule?.timeRange || { start: "09:00", end: "17:00" }
                        }
                      }
                    }))}
                  />
                  <Label>Enable Schedule-based Policy</Label>
                </div>

                {formData.rules?.schedule?.enabled && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <Label className="text-sm font-medium">Active Days</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <Badge
                            key={day}
                            variant={(formData.rules?.schedule?.days || []).includes(day) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const currentDays = formData.rules?.schedule?.days || [];
                              const days = currentDays.includes(day)
                                ? currentDays.filter(d => d !== day)
                                : [...currentDays, day];
                              setFormData(prev => ({
                                ...prev,
                                rules: {
                                  ...prev.rules,
                                  schedule: { 
                                    ...prev.rules?.schedule,
                                    enabled: prev.rules?.schedule?.enabled || false,
                                    days,
                                    timeRange: prev.rules?.schedule?.timeRange || { start: "09:00", end: "17:00" }
                                  }
                                }
                              }));
                            }}
                          >
                            {day.substring(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Start Time</Label>
                        <Input
                          type="time"
                          value={formData.rules?.schedule?.timeRange?.start || "09:00"}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            rules: {
                              ...prev.rules,
                              schedule: {
                                ...prev.rules?.schedule,
                                enabled: prev.rules?.schedule?.enabled || false,
                                days: prev.rules?.schedule?.days || [],
                                timeRange: { 
                                  ...prev.rules?.schedule?.timeRange, 
                                  start: e.target.value,
                                  end: prev.rules?.schedule?.timeRange?.end || "17:00"
                                }
                              }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Time</Label>
                        <Input
                          type="time"
                          value={formData.rules?.schedule?.timeRange?.end || "17:00"}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            rules: {
                              ...prev.rules,
                              schedule: {
                                ...prev.rules?.schedule,
                                enabled: prev.rules?.schedule?.enabled || false,
                                days: prev.rules?.schedule?.days || [],
                                timeRange: { 
                                  ...prev.rules?.schedule?.timeRange,
                                  start: prev.rules?.schedule?.timeRange?.start || "09:00",
                                  end: e.target.value
                                }
                              }
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exceptions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Policy Exceptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newException}
                    onChange={(e) => setNewException(e.target.value)}
                    placeholder="Add exception (e.g., specific domain, user group)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addException())}
                  />
                  <Button type="button" onClick={addException} size="sm">
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.rules.exceptions || []).map((exception, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {exception}
                      <button
                        type="button"
                        onClick={() => removeException(exception)}
                        className="ml-1 text-xs hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.notifications.enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enabled: checked }
                    }))}
                  />
                  <Label>Enable Notifications</Label>
                </div>

                {formData.notifications.enabled && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Notification Recipients</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newNotificationRecipient}
                          onChange={(e) => setNewNotificationRecipient(e.target.value)}
                          placeholder="Add email address"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNotificationRecipient())}
                        />
                        <Button type="button" onClick={addNotificationRecipient} size="sm">
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.notifications.recipients.map((recipient, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {recipient}
                            <button
                              type="button"
                              onClick={() => removeNotificationRecipient(recipient)}
                              className="ml-1 text-xs hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Notification Channels</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['email', 'slack', 'teams', 'webhook', 'sms'].map(channel => (
                          <Badge
                            key={channel}
                            variant={formData.notifications.channels.includes(channel) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const channels = formData.notifications.channels.includes(channel)
                                ? formData.notifications.channels.filter(c => c !== channel)
                                : [...formData.notifications.channels, channel];
                              setFormData(prev => ({
                                ...prev,
                                notifications: { ...prev.notifications, channels }
                              }));
                            }}
                          >
                            <i className={`fas fa-${channel === 'email' ? 'envelope' : channel === 'slack' ? 'slack' : channel === 'teams' ? 'microsoft' : channel === 'webhook' ? 'link' : 'mobile'} mr-1`}></i>
                            {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.notifications.escalation}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, escalation: checked }
                        }))}
                      />
                      <Label>Enable Escalation (notify after 15 minutes if unacknowledged)</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            {/* Compliance Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance Framework</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Regulatory Framework</Label>
                  <Select 
                    value={formData.compliance.framework} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      compliance: { ...prev.compliance, framework: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select compliance framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gdpr">GDPR</SelectItem>
                      <SelectItem value="ccpa">CCPA</SelectItem>
                      <SelectItem value="hipaa">HIPAA</SelectItem>
                      <SelectItem value="sox">SOX</SelectItem>
                      <SelectItem value="pci_dss">PCI DSS</SelectItem>
                      <SelectItem value="iso27001">ISO 27001</SelectItem>
                      <SelectItem value="nist">NIST</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Compliance Requirements</Label>
                  <Textarea
                    placeholder="Enter specific compliance requirements this policy addresses..."
                    value={formData.compliance.requirements.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        requirements: e.target.value.split('\n').filter(req => req.trim())
                      }
                    }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="name">Policy Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter policy name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Policy Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dlp">Data Loss Prevention</SelectItem>
                    <SelectItem value="phishing">Phishing Protection</SelectItem>
                    <SelectItem value="executive_protection">Executive Protection</SelectItem>
                    <SelectItem value="behavioral">Behavioral Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this policy does..."
                  className="h-24"
                />
              </div>

              <div>
                <Label>Target Users</Label>
                {/* RadioGroup to select target user type */}
                <RadioGroup 
                  defaultValue={formData.targetUsers.groups.includes('all') ? 'all' :
                              formData.targetUsers.roles.length > 0 ? 'executive' : 'groups'}
                  onValueChange={(value) => {
                    const updatedTargetUsers = {
                      groups: value === 'all' ? ['all'] : [],
                      roles: value === 'executive' ? ['executive'] : [],
                      departments: [],
                      specificUsers: []
                    };
                    setFormData({ ...formData, targetUsers: updatedTargetUsers });
                  }}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="groups" id="groups" />
                    <Label htmlFor="groups">Specific Groups</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="executive" id="executive" />
                    <Label htmlFor="executive">Executive Team Only</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Conditionally render group selection based on target user type */}
              {formData.targetUsers.groups && !formData.targetUsers.groups.includes('all') && (
                <div>
                  <Label>Select Groups</Label>
                  <div className="space-y-2 mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <Switch />
                      <div className="flex-1">
                        <span className="text-sm font-medium">Executive Team</span>
                        <p className="text-xs text-gray-500">C-level executives and senior leadership</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">3 users</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <Switch />
                      <div className="flex-1">
                        <span className="text-sm font-medium">Finance Team</span>
                        <p className="text-xs text-gray-500">Financial operations and accounting staff</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">12 users</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <Switch />
                      <div className="flex-1">
                        <span className="text-sm font-medium">IT Team</span>
                        <p className="text-xs text-gray-500">Information technology and security staff</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">8 users</Badge>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <Switch />
                      <div className="flex-1">
                        <span className="text-sm font-medium">Marketing Team</span>
                        <p className="text-xs text-gray-500">Marketing and communications staff</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">15 users</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected groups will be targeted by this policy. Users can belong to multiple groups.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="severity">Severity Level</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              {/* Conditions Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Conditions</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add new condition (e.g., contains_pii, external_recipient)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  />
                  <Button type="button" onClick={addCondition} size="sm">
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.rules.conditions || []).map((condition, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeCondition(condition)}
                        className="ml-1 text-xs hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Actions</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Add new action (e.g., block, alert_admin, quarantine)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                  />
                  <Button type="button" onClick={addAction} size="sm">
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.rules.actions || []).map((action, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {action}
                      <button
                        type="button"
                        onClick={() => removeAction(action)}
                        className="ml-1 text-xs hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Keywords Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword (e.g., confidential, ssn, credit_card)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.rules.keywords || []).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-xs hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                onClose?.();
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={savePolicyMutation.isPending}
            >
              {savePolicyMutation.isPending ? 
                (editPolicy ? "Updating..." : "Creating...") : 
                (editPolicy ? "Update Policy" : "Create Policy")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}