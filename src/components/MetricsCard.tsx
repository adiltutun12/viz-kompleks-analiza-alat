import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricsCardProps {
  title: string;
  value: number;
  maxValue?: number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const MetricsCard = ({
  title,
  value,
  maxValue = 100,
  unit = "",
  icon,
  description,
  variant = "default"
}: MetricsCardProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "danger":
        return "border-destructive/20 bg-destructive/5";
      default:
        return "border-border bg-card";
    }
  };

  const getProgressColor = () => {
    if (percentage < 30) return "bg-success";
    if (percentage < 70) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className={`shadow-card hover:shadow-glow transition-all duration-300 ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value.toLocaleString()}{unit}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        <div className="mt-3">
          <Progress 
            value={percentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>{maxValue.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;