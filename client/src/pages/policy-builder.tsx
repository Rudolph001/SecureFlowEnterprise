import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import PolicyModal from "@/components/policy-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PolicyBuilder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['/api/policies'],
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PUT", `/api/policies/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Policy Updated",
        description: "Policy has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update policy.",
        variant: "destructive",
      });
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/policies/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Policy Deleted",
        description: "Policy has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete policy.",
        variant: "destructive",
      });
    },
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      dlp: "fas fa-shield-check",
      phishing: "fas fa-fish",
      executive_protection: "fas fa-user-shield",
      behavioral: "fas fa-brain",
    };
    return icons[type as keyof typeof icons] || "fas fa-cog";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      dlp: "text-green-600",
      phishing: "text-red-600",
      executive_protection: "text-blue-600",
      behavioral: "text-purple-600",
    };
    return colors[type as keyof typeof colors] || "text-gray-600";
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      high: "secondary",
      medium: "default",
      low: "outline",
    };
    return variants[severity as keyof typeof variants] || "default";
  };

  const filteredPolicies = policies?.filter((policy: any) => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || policy.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const togglePolicyStatus = (policy: any) => {
    updatePolicyMutation.mutate({
      id: policy.id,
      updates: { isActive: !policy.isActive }
    });
  };

  const handleDeletePolicy = (id: number) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      deletePolicyMutation.mutate(id);
    }
  };

  return (
    <>
      <Header
        title="Policy Builder"
        description="Comprehensive policy creation system for email security rules and enforcement"
        threatLevel="low"
        alertCount={1}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Policy Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Security Policies</CardTitle>
              <PolicyModal>
                <Button className="bg-tessian-primary hover:bg-tessian-primary/90">
                  <i className="fas fa-plus mr-2"></i>
                  Create Policy
                </Button>
              </PolicyModal>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dlp">Data Loss Prevention</SelectItem>
                  <SelectItem value="phishing">Phishing Protection</SelectItem>
                  <SelectItem value="executive_protection">Executive Protection</SelectItem>
                  <SelectItem value="behavioral">Behavioral Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Policy Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-900">{filteredPolicies.filter((p: any) => p.isActive).length}</p>
                <p className="text-sm text-green-700">Active Policies</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-900">{filteredPolicies.length}</p>
                <p className="text-sm text-blue-700">Total Policies</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-900">{filteredPolicies.filter((p: any) => p.severity === 'critical').length}</p>
                <p className="text-sm text-amber-700">Critical Policies</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round((filteredPolicies.filter((p: any) => p.isActive).length / Math.max(filteredPolicies.length, 1)) * 100)}%
                </p>
                <p className="text-sm text-purple-700">Active Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredPolicies.length === 0 ? (
            <Card className="lg:col-span-2">
              <CardContent className="text-center py-12">
                <i className="fas fa-shield-alt text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== "all" 
                    ? "Try adjusting your search or filter criteria." 
                    : "Get started by creating your first security policy."}
                </p>
                <PolicyModal>
                  <Button className="bg-tessian-primary hover:bg-tessian-primary/90">
                    Create First Policy
                  </Button>
                </PolicyModal>
              </CardContent>
            </Card>
          ) : (
            filteredPolicies.map((policy: any) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <i className={`${getTypeIcon(policy.type)} ${getTypeColor(policy.type)} text-lg`}></i>
                      <div>
                        <h3 className="font-semibold text-slate-900">{policy.name}</h3>
                        <p className="text-sm text-slate-600 capitalize">
                          {policy.type.replace('_', ' ')} Policy
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityBadge(policy.severity)}>
                        {policy.severity?.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={policy.isActive}
                        onCheckedChange={() => togglePolicyStatus(policy)}
                        disabled={updatePolicyMutation.isPending}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    {policy.description || "No description provided"}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Target Users:</span>
                      <span className="font-medium">
                        {policy.targetUsers?.groups?.includes('all') ? 'All Users' : 
                         policy.targetUsers?.roles?.includes('executive') ? 'Executives' : 
                         'Specific Groups'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Rules:</span>
                      <span className="font-medium">
                        {policy.rules?.conditions?.length || 0} conditions
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Created:</span>
                      <span className="font-medium">
                        {new Date(policy.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-copy mr-1"></i>
                        Clone
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePolicy(policy.id)}
                      disabled={deletePolicyMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Policy Templates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Policy Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-tessian-primary hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center">
                  <i className="fas fa-shield-check text-2xl text-green-600 mb-2"></i>
                  <h4 className="font-medium text-slate-900 mb-1">Data Loss Prevention</h4>
                  <p className="text-sm text-slate-600">Prevent sensitive data exfiltration</p>
                </div>
              </div>
              
              <div className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-tessian-primary hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center">
                  <i className="fas fa-fish text-2xl text-red-600 mb-2"></i>
                  <h4 className="font-medium text-slate-900 mb-1">Anti-Phishing</h4>
                  <p className="text-sm text-slate-600">Block phishing and malicious emails</p>
                </div>
              </div>
              
              <div className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-tessian-primary hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center">
                  <i className="fas fa-user-shield text-2xl text-blue-600 mb-2"></i>
                  <h4 className="font-medium text-slate-900 mb-1">Executive Protection</h4>
                  <p className="text-sm text-slate-600">Enhanced security for leadership</p>
                </div>
              </div>
              
              <div className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-tessian-primary hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center">
                  <i className="fas fa-brain text-2xl text-purple-600 mb-2"></i>
                  <h4 className="font-medium text-slate-900 mb-1">Behavioral Analysis</h4>
                  <p className="text-sm text-slate-600">AI-powered anomaly detection</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
