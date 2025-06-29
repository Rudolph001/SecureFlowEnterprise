import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  icon: string;
  iconColor?: string;
  className?: string;
}

export default function MetricsCard({
  title,
  value,
  trend,
  icon,
  iconColor = "text-blue-600",
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn("tessian-metric-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <p className={cn(
                "text-sm mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                <i className={cn(
                  "mr-1",
                  trend.isPositive ? "fas fa-arrow-up" : "fas fa-arrow-down"
                )}></i>
                {trend.value} vs {trend.period}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconColor.includes('blue') ? 'bg-blue-100' :
            iconColor.includes('green') ? 'bg-green-100' :
            iconColor.includes('red') ? 'bg-red-100' :
            iconColor.includes('purple') ? 'bg-purple-100' :
            iconColor.includes('amber') ? 'bg-amber-100' :
            'bg-gray-100'
          )}>
            <i className={cn(icon, iconColor, "text-xl")}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
