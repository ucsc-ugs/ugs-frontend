// src/components/ui/charts/pie-chart.tsx
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"];

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export function PieChart({ data, height = 300 }: PieChartProps) {
  const renderCustomizedLabel = ({
    name,
    percent = 0
  }: {
    name: string;
    percent?: number;
  }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            label={renderCustomizedLabel}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              fontSize: '0.875rem',
            }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}