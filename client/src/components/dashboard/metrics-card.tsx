import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: "red" | "blue" | "green" | "purple";
}

const colorClasses = {
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600", 
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

const changeColors = {
  "+": "text-green-600",
  "-": "text-red-600",
  "": "text-slate-600",
};

export default function MetricsCard({ title, value, change, icon: Icon, color }: MetricsCardProps) {
  const changeSign = change.charAt(0);
  const changeColor = changeColors[changeSign as keyof typeof changeColors] || changeColors[""];

  return (
    <Card className="metric-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            <p className={`text-sm mt-1 ${changeColor}`}>
              {change} vs last week
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
