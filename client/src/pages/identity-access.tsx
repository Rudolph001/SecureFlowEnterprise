import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function IdentityAccess() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PUT", `/api/users/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: "fas fa-crown",
      security_admin: "fas fa-shield-alt",
      user: "fas fa-user",
    };
    return icons[role as keyof typeof icons] || "fas fa-user";
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "text-red-600",
      security_admin: "text-blue-600",
      user: "text-gray-600",
    };
    return colors[role as keyof typeof colors] || "text-gray-600";
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      security_admin: "secondary",
      user: "default",
    };
    return variants[role as keyof typeof variants] || "default";
  };

  const mockUsers = users || [
    {
      id: 1,
      username: "admin",
      email: "admin@acme.com",
      firstName: "John",
      lastName: "Doe",
      role: "security_admin",
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      username: "jsmith",
      email: "jane.smith@acme.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "user",
      isActive: true,
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ];

  const filteredUsers = mockUsers.filter((user: any) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    return 'Just now';
  };

  const toggleUserStatus = (user: any) => {
    updateUserMutation.mutate({
      id: user.id,
      updates: { isActive: !user.isActive }
    });
  };

  return (
    <>
      <Header
        title="Identity & Access Management"
        description="RBAC, SSO integration, and admin privilege separation for enterprise control"
        threatLevel="low"
        alertCount={0}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* IAM Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">{filteredUsers.length}</p>
                </div>
                <i className="fas fa-users text-2xl text-blue-600"></i>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Users</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredUsers.filter((u: any) => u.isActive).length}
                  </p>
                </div>
                <i className="fas fa-user-check text-2xl text-green-600"></i>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredUsers.filter((u: any) => u.role.includes('admin')).length}
                  </p>
                </div>
                <i className="fas fa-shield-alt text-2xl text-red-600"></i>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">SSO Enabled</p>
                  <p className="text-3xl font-bold text-slate-900">98%</p>
                </div>
                <i className="fas fa-key text-2xl text-purple-600"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group Management */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Security Groups</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mr-2">
                    <i className="fas fa-users mr-2"></i>
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Security Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Group Name</Label>
                      <Input placeholder="e.g., Executive Team, Finance Team" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input placeholder="Group description" />
                    </div>
                    <Button className="w-full">Create Group</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Executive Team</h4>
                    <Badge variant="secondary">3 members</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">C-level executives and senior leadership</p>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-users mr-1"></i>
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Executive Team Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Members</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">John Doe (admin@acme.com)</span>
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">Sarah Johnson (sarah@acme.com)</span>
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Add New Member</Label>
                            <div className="flex gap-2 mt-2">
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="jane.smith@acme.com">Jane Smith</SelectItem>
                                  <SelectItem value="mike.brown@acme.com">Mike Brown</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button>Add</Button>
                            </div>
                          </div>
                          <Button className="w-full">Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Executive Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Group Name</Label>
                            <Input defaultValue="Executive Team" />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input defaultValue="C-level executives and senior leadership" />
                          </div>
                          <div>
                            <Label>Permissions</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <span className="text-sm">All Policy Management</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <span className="text-sm">User Management</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <span className="text-sm">System Configuration</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full">Update Group</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Finance Team</h4>
                    <Badge variant="secondary">12 members</Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-3">Financial operations and accounting staff</p>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-users mr-1"></i>
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Executive Team Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Members</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">John Doe (admin@acme.com)</span>
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">Sarah Johnson (sarah@acme.com)</span>
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Add New Member</Label>
                            <div className="flex gap-2 mt-2">
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="jane.smith@acme.com">Jane Smith</SelectItem>
                                  <SelectItem value="mike.brown@acme.com">Mike Brown</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button>Add</Button>
                            </div>
                          </div>
                          <Button className="w-full">Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Executive Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Group Name</Label>
                            <Input defaultValue="Executive Team" />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input defaultValue="C-level executives and senior leadership" />
                          </div>
                          <div>
                            <Label>Permissions</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <span className="text-sm">All Policy Management</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <span className="text-sm">User Management</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <span className="text-sm">System Configuration</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full">Update Group</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900">IT Team</h4>
                    <Badge variant="secondary">8 members</Badge>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">Information technology and security staff</p>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-users mr-1"></i>
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Executive Team Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Members</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">John Doe (admin@acme.com)</span>
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                              <div className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">Sarah Johnson (sarah@acme.com)</span>
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Add New Member</Label>
                            <div className="flex gap-2 mt-2">
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="jane.smith@acme.com">Jane Smith</SelectItem>
                                  <SelectItem value="mike.brown@acme.com">Mike Brown</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button>Add</Button>
                            </div>
                          </div>
                          <Button className="w-full">Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Executive Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Group Name</Label>
                            <Input defaultValue="Executive Team" />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input defaultValue="C-level executives and senior leadership" />
                          </div>
                          <div>
                            <Label>Permissions</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <span className="text-sm">All Policy Management</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <span className="text-sm">User Management</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <span className="text-sm">System Configuration</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full">Update Group</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-tessian-primary hover:bg-tessian-primary/90">
                    <i className="fas fa-plus mr-2"></i>
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>First Name</Label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input placeholder="Doe" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input placeholder="john.doe@company.com" />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="security_admin">Security Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Create User</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="security_admin">Security Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="space-y-4">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-tessian-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        Last login: {formatLastLogin(user.lastLogin)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <i className={`${getRoleIcon(user.role)} ${getRoleColor(user.role)}`}></i>
                      <Badge variant={getRoleBadge(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Show user's groups */}
                      {user.id === 1 && (
                        <>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Executive</Badge>
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">IT Team</Badge>
                        </>
                      )}
                      {user.id === 2 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Finance</Badge>
                      )}
                    </div>

                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => toggleUserStatus(user)}
                    />

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-users mr-1"></i>
                          Groups
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage User Groups - {user.firstName} {user.lastName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Current Groups</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user.id === 1 && (
                                <>
                                  <Badge variant="secondary">Executive Team</Badge>
                                  <Badge variant="secondary">IT Team</Badge>
                                </>
                              )}
                              {user.id === 2 && (
                                <Badge variant="secondary">Finance Team</Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Available Groups</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <span className="text-sm">Executive Team</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <span className="text-sm">Finance Team</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <span className="text-sm">IT Team</span>
                              </div>
                            </div>
                          </div>

                          <Button className="w-full">Update Group Memberships</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <i className="fas fa-edit"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* IAM Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SSO Integration */}
          <Card>
            <CardHeader>
              <CardTitle>SSO Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-microsoft text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Azure Active Directory</p>
                      <p className="text-xs text-slate-600">SAML 2.0 Integration</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-google text-red-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Google Workspace</p>
                      <p className="text-xs text-slate-600">OAuth 2.0 Integration</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-okta text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Okta</p>
                      <p className="text-xs text-slate-600">Ready to Configure</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">SSO Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Users with SSO</span>
                      <span className="font-medium">8,267 (98%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">SSO Logins Today</span>
                      <span className="font-medium">2,341</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Failed Attempts</span>
                      <span className="font-medium text-red-600">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Based Access Control */}
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-crown text-red-600"></i>
                      <span className="font-medium">Administrator</span>
                    </div>
                    <span className="text-sm text-slate-600">2 users</span>
                  </div>
                  <p className="text-xs text-slate-600">Full system access, user management, policy creation</p>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-shield-alt text-blue-600"></i>
                      <span className="font-medium">Security Admin</span>
                    </div>
                    <span className="text-sm text-slate-600">5 users</span>
                  </div>
                  <p className="text-xs text-slate-600">Security policies, threat management, user monitoring</p>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-user text-gray-600"></i>
                      <span className="font-medium">User</span>
                    </div>
                    <span className="text-sm text-slate-600">8,425 users</span>
                  </div>
                  <p className="text-xs text-slate-600">Standard email access, basic security features</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Policy Management</span>
                      <span className="text-green-600">24 permissions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">User Management</span>
                      <span className="text-blue-600">18 permissions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Security Operations</span>
                      <span className="text-purple-600">32 permissions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">System Configuration</span>
                      <span className="text-amber-600">15 permissions</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <i className="fas fa-cog mr-2"></i>
                  Manage Roles & Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}