
import React from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps
} from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#3E8EDE',
  height = 40
}) => {
  // Format data for recharts
  const chartData = data.map((value, index) => ({ 
    value,
    index 
  }));
  
  // Find min and max values for domain
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const padding = (maxValue - minValue) * 0.1;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip 
          content={<SparklineTooltip />}
          cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="url(#sparklineGradient)"
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Define a custom tooltip component that works with recharts' expected types
interface SparklineTooltipProps {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
}

const SparklineTooltip: React.FC<SparklineTooltipProps> = (props) => {
  const { active, payload } = props;
  
  if (!active || !payload || !payload[0]) {
    return null;
  }

  return (
    <div className="rounded-md bg-background border border-border p-2 text-xs shadow">
      <p className="font-medium">{payload[0].value}</p>
    </div>
  );
};
