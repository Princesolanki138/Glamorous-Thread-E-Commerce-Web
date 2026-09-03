'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface AdminBarChartProps {
  data: { label: string; value: number }[]
  valueLabel?: string
}

export default function AdminBarChart({ data, valueLabel = 'Count' }: AdminBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 45 }}>
        <CartesianGrid stroke="#1F1F1F" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#2A2A2A"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#1F1F1F' }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          stroke="#2A2A2A"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={36}
        />
        <Tooltip
          contentStyle={{ background: '#141414', border: '1px solid #1F1F1F', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: '#D4D4D4' }}
          itemStyle={{ color: '#D4D4D4' }}
          cursor={{ fill: '#1A1A1A' }}
          formatter={(value) => [value as number, valueLabel]}
        />
        <Bar dataKey="value" fill="#D4D4D4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
