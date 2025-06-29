import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PolicyModalProps {
  children: React.ReactNode;
  onPolicyCreated?: () => void;
}

export default function PolicyModal({ children, onPolicyCreated }: PolicyModalProps) {
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/policies", data);
    },
    onSuccess: () => {
      toast({
        title: "Policy Created",
        description: "Security policy has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setOpen(false);
      resetForm();
      onPolicyCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create policy.",
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

    // Build rules based on policy type
    const rules = {
      conditions: formData.type === "dlp" ? ["contains_pii", "external_recipient"] :
                 formData.type === "phishing" ? ["suspicious_sender", "malicious_link"] :
                 formData.type === "executive_protection" ? ["executive_target", "suspicious_sender"] :
                 ["behavioral_anomaly"],
      actions: formData.type === "dlp" ? ["block", "alert_admin"] :
              formData.type === "phishing" ? ["quarantine", "alert_security_team"] :
              ["warn", "log_event"],
      keywords: formData.type === "dlp" ? ["confidential", "ssn", "credit_card"] : [],
    };

    const targetUsers = formData.targetUsers === "all" ? { groups: ["all"] } :
                       formData.targetUsers === "groups" ? { groups: ["specific"] } :
                       { roles: ["executive"] };

    createPolicyMutation.mutate({
      ...formData,
      rules,
      targetUsers,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Security Policy</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPolicyMutation.isPending}
            >
              {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
