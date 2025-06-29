import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function ModuleStatus() {
  const { data: moduleStatus, isLoading } = useQuery({
    queryKey: ['/api/dashboard/modules'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIndicator = (status: string) => {
    const indicators = {
      active: 'w-2 h-2 bg-green-400 rounded-full',
      learning: 'w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow',
      training: 'w-2 h-2 bg-amber-400 rounded-full animate-pulse',
      error: 'w-2 h-2 bg-red-400 rounded-full',
    };
    return indicators[status as keyof typeof indicators] || indicators.active;
  };

  const getModuleIcon = (module: string) => {
    const icons = {
      guardian: 'fas fa-eye text-green-600',
      enforcer: 'fas fa-ban text-red-600',
      defender: 'fas fa-shield-virus text-blue-600',
      architect: 'fas fa-brain text-purple-600',
      coach: 'fas fa-graduation-cap text-amber-600',
    };
    return icons[module as keyof typeof icons] || 'fas fa-cog text-gray-600';
  };

  const getModuleDescription = (module: string, data: any) => {
    const descriptions = {
      guardian: `Monitoring ${data?.throughput || 0} emails/hour`,
      enforcer: `Blocked ${data?.blocked || 0} exfiltration attempts`,
      defender: `${((data?.detectionRate || 0) * 100).toFixed(1)}% threat detection rate`,
      architect: data?.status === 'training' ? 'ML models retraining' : 'Behavioral analysis active',
      coach: `${data?.trainingCompleted || 0} users completed training`,
    };
    return descriptions[module as keyof typeof descriptions] || 'Module operational';
  };

  // Mock data structure
  const mockModuleStatus = {
    guardian: { status: 'active', performance: 99.4, throughput: 2431 },
    enforcer: { status: 'active', performance: 98.7, blocked: 12 },
    defender: { status: 'active', performance: 99.7, detectionRate: 0.997 },
    architect: { status: 'training', performance: 96.2, progress: 0.65 },
    coach: { status: 'active', performance: 95.8, trainingCompleted: 15 },
  };

  const modules = moduleStatus || mockModuleStatus;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                </div>
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
          {Object.entries(modules).map(([module, data]: [string, any]) => (
            <div key={module} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <i className={cn(getModuleIcon(module), "text-sm")}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {module}
                  </p>
                  <p className="text-xs text-slate-600">
                    {getModuleDescription(module, data)}
                  </p>
                </div>
              </div>
              <div className={getStatusIndicator(data.status)}></div>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4 bg-tessian-primary hover:bg-tessian-primary/90">
          Configure Modules
        </Button>
      </CardContent>
    </Card>
  );
}
