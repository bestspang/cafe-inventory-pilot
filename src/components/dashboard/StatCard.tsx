
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: React.ReactNode;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  sparklineData,
  onClick,
  isLoading = false,
  className 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const valueAsNumber = typeof value === 'string' ? parseInt(value, 10) : value;
  const finalValue = isNaN(valueAsNumber) ? 0 : valueAsNumber;
  
  // Animation effect for counter
  useEffect(() => {
    if (isLoading) return;
    
    // Skip animation for non-numeric values
    if (typeof value !== 'number') {
      setDisplayValue(0);
      return;
    }
    
    const duration = 1000; // 1 second animation
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let currentFrame = 0;
    
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const currentCount = Math.round(finalValue * progress);
      
      setDisplayValue(currentCount);
      
      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
    
    return () => clearInterval(counter);
  }, [finalValue, isLoading, value]);
  
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden transition-all", className)}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md hover:translate-y-[-2px]", 
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? displayValue : value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-mint-600" : "text-destructive"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                <span className="text-muted-foreground ml-1">vs last month</span>
              </p>
            )}
          </div>
          <div className="rounded-full p-2 bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-10">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
