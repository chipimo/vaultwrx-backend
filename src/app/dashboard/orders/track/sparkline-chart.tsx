'use client';

import { ChartContainer } from '@/components/ui/chart';
import { Line, LineChart } from 'recharts';

interface SparklineChartProps {
  data: { value: number }[];
  className?: string;
}

const chartConfig = {
  value: {
    label: 'Value',
    color: '#3b82f6'
  }
};

export function SparklineChart({ data, className }: SparklineChartProps) {
  return (
    <div className={`h-8 w-24 ${className}`}>
      <ChartContainer config={chartConfig} className='h-full w-full'>
        <LineChart data={data}>
          <Line
            type='monotone'
            dataKey='value'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
