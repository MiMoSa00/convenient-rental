import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
  index?: number;
  trend?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  index = 0,
  trend,
}: StatCardProps) {
  return (
    <Card
      className="group relative overflow-hidden hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1 border-border/50 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Background Gradient Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
      
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                {value}
              </p>
              {trend && (
                <span className="text-sm font-medium text-success">
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 group-hover:w-full`}
            style={{ width: '60%' }}
          />
        </div>
      </div>
    </Card>
  );
}
