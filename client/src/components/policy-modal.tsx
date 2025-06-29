import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";

interface PolicyModalProps {
  children: React.ReactNode;
  editPolicy?: any;
  onPolicyCreated?: () => void;
  onClose?: () => void;
}

export default function PolicyModal({ children, editPolicy, onPolicyCreated, onClose }: PolicyModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    targetUsers: "all",
    severity: "medium",
    rules: {
      conditions: [] as string[],
      actions: [] as string[],
      keywords: [] as string[],
    },
  });

  const [newCondition, setNewCondition] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  // Effect to populate form when editing
  useEffect(() => {
    if (editPolicy) {
      setFormData({
        name: editPolicy.name || "",
        type: editPolicy.type || "",
        description: editPolicy.description || "",
        targetUsers: editPolicy.targetUsers?.groups?.includes('all') ? 'all' :
                    editPolicy.targetUsers?.roles?.includes('executive') ? 'executive' : 'groups',
        severity: editPolicy.severity || "medium",
        rules: editPolicy.rules || {
          conditions: [],
          actions: [],
          keywords: [],
        },
      });
      setOpen(true);
    }
  }, [editPolicy]);

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
      onPolicyCreated?.();
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
      type: "",
      description: "",
      targetUsers: "all",
      severity: "medium",
      rules: {
        conditions: [],
        actions: [],
        keywords: [],
      },
    });
    setNewCondition("");
    setNewAction("");
    setNewKeyword("");
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.rules.conditions.includes(newCondition.trim())) {
      setFormData({
        ...formData,
        rules: {
          ...formData.rules,
          conditions: [...formData.rules.conditions, newCondition.trim()]
        }
      });
      setNewCondition("");
    }
  };

  const removeCondition = (condition: string) => {
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        conditions: formData.rules.conditions.filter(c => c !== condition)
      }
    });
  };

  const addAction = () => {
    if (newAction.trim() && !formData.rules.actions.includes(newAction.trim())) {
      setFormData({
        ...formData,
        rules: {
          ...formData.rules,
          actions: [...formData.rules.actions, newAction.trim()]
        }
      });
      setNewAction("");
    }
  };

  const removeAction = (action: string) => {
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        actions: formData.rules.actions.filter(a => a !== action)
      }
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.rules.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        rules: {
          ...formData.rules,
          keywords: [...formData.rules.keywords, newKeyword.trim()]
        }
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        keywords: formData.rules.keywords.filter(k => k !== keyword)
      }
    });
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

    // Use the custom rules from the form, or fall back to defaults for new policies
    const rules = editPolicy ? formData.rules : {
      conditions: formData.rules.conditions.length > 0 ? formData.rules.conditions :
                 formData.type === "dlp" ? ["contains_pii", "external_recipient"] :
                 formData.type === "phishing" ? ["suspicious_sender", "malicious_link"] :
                 formData.type === "executive_protection" ? ["executive_target", "suspicious_sender"] :
                 ["behavioral_anomaly"],
      actions: formData.rules.actions.length > 0 ? formData.rules.actions :
              formData.type === "dlp" ? ["block", "alert_admin"] :
              formData.type === "phishing" ? ["quarantine", "alert_security_team"] :
              ["warn", "log_event"],
      keywords: formData.rules.keywords.length > 0 ? formData.rules.keywords :
               formData.type === "dlp" ? ["confidential", "ssn", "credit_card"] : [],
    };

    const targetUsers = formData.targetUsers === "all" ? { groups: ["all"] } :
                       formData.targetUsers === "groups" ? { groups: ["specific"] } :
                       { roles: ["executive"] };

    savePolicyMutation.mutate({
      ...formData,
      rules,
      targetUsers,
    });
  };

  const targetUsers = formData.targetUsers;

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPolicy ? 'Edit Security Policy' : 'Create Security Policy'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="rules">Rules & Conditions</TabsTrigger>
            </TabsList>

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
                <RadioGroup 
                  value={formData.targetUsers} 
                  onValueChange={(value) => setFormData({ ...formData, targetUsers: value })}
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

              {targetUsers === "groups" && (
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
                  {formData.rules.conditions.map((condition, index) => (
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
                  {formData.rules.actions.map((action, index) => (
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
                  {formData.rules.keywords.map((keyword, index) => (
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