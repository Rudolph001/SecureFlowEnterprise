import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Ban, ShieldCheck, Brain, GraduationCap } from "lucide-react";

interface Module {
  name: string;
  icon: string;
  status: string;
  metric: string;
  color: string;
}

const moduleIcons = {
  eye: Eye,
  ban: Ban,
  "shield-virus": ShieldCheck,
  brain: Brain,
  "graduation-cap": GraduationCap,
};

const statusColors = {
  active: "bg-green-400",
  retraining: "bg-amber-400 animate-pulse",
  error: "bg-red-400",
};

export default function ModuleStatus() {
  const { data: modules, isLoading } = useQuery<Module[]>({
    queryKey: ["/api/dashboard/modules"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules?.map((module) => {
            const Icon = moduleIcons[module.icon as keyof typeof moduleIcons] || Eye;
            const statusColor = statusColors[module.status as keyof typeof statusColors] || statusColors.active;
            
            return (
              <div key={module.name} className="module-status-card">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getModuleColor(module.color)} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{module.name}</p>
                    <p className="text-xs text-slate-600">{module.metric}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${statusColor}`} />
              </div>
            );
          })}

          <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
            Configure Modules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getModuleColor(color: string): string {
  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500", 
    purple: "bg-purple-500",
  };
  
  return colors[color as keyof typeof colors] || "bg-slate-500";
}
