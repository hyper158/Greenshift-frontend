import { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import { ServerOptimizationResult } from '@/types';

interface EmissionChartProps {
  servers: ServerOptimizationResult[];
  mode: 'before' | 'after';
  /** fixed y-axis max so before/after share consistent scale */
  yMax?: number;
  thresholdColor?: string;
}

const EmissionChart = forwardRef<HTMLDivElement, EmissionChartProps>(
  ({ servers, mode, yMax, thresholdColor = '#10b981' }, ref) => {
    const data = servers.map((s) => {
      const emission = mode === 'before' ? s.co2_before : s.co2_after;
      const workload = mode === 'before' ? s.workload_before : s.workload_after;
      const overloaded = emission > s.threshold;
      return {
        name: s.server_name,
        emission,
        workload,
        threshold: s.threshold,
        overloaded,
        status: overloaded ? 'Overloaded' : 'Safe',
      };
    });

    // Unique thresholds to display as reference lines if identical or fleet-wide,
    // or calculate fleet average threshold for reference line
    const thresholds = Array.from(new Set(data.map((d) => d.threshold)));
    const avgThreshold = thresholds.length > 0
      ? thresholds.reduce((a, b) => a + b, 0) / thresholds.length
      : 0;

    return (
      <div ref={ref} className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1d3563" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#7e98bd"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#1d3563' }}
            />
            <YAxis
              stroke="#7e98bd"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#1d3563' }}
              domain={[0, yMax ?? 'auto']}
            >
              <Label
                value="CO₂ Emission"
                angle={-90}
                position="insideLeft"
                style={{ fill: '#94a3b8', fontSize: 12 }}
              />
            </YAxis>
            <Tooltip
              cursor={{ fill: 'rgba(45,74,133,0.2)' }}
              contentStyle={{
                background: '#0f1b38',
                border: '1px solid #1d3563',
                borderRadius: 12,
                color: '#e2e8f0',
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              formatter={(value, name) => {
                if (name === 'emission') return [`${Number(value).toFixed(2)}`, 'CO₂ Emission'];
                if (name === 'workload') return [`${Number(value).toFixed(2)}`, 'Workload'];
                return [String(value), String(name)];
              }}
            />
            {/* Green horizontal threshold line */}
            {thresholds.length <= 3 ? (
              thresholds.map((t) => (
                <ReferenceLine
                  key={t}
                  y={t}
                  stroke={thresholdColor}
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: `Threshold: ${t.toFixed(1)}`,
                    position: 'right',
                    fill: thresholdColor,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              ))
            ) : (
              <ReferenceLine
                y={avgThreshold}
                stroke={thresholdColor}
                strokeDasharray="5 4"
                strokeWidth={2}
                ifOverflow="extendDomain"
                label={{
                  value: `Avg Threshold: ${avgThreshold.toFixed(1)}`,
                  position: 'right',
                  fill: thresholdColor,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
            <Bar dataKey="emission" radius={[4, 4, 0, 0]} maxBarSize={56}>
              {data.map((d, i) => (
                <Cell
                  key={`cell-${i}`}
                  // Blue: Emissions within threshold. Red: Emissions exceeding threshold.
                  fill={d.overloaded ? '#ef4444' : '#38bdf8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

EmissionChart.displayName = 'EmissionChart';
export default EmissionChart;
