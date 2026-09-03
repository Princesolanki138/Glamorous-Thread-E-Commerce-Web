'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1F1F1F" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#2A2A2A"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#1F1F1F' }}
        />
        <YAxis
          stroke="#2A2A2A"
          tick={{ fill: '#6B7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip
          contentStyle={{ background: '#141414', border: '1px solid #1F1F1F', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: '#D4D4D4' }}
          itemStyle={{ color: '#D4D4D4' }}
          cursor={{ stroke: '#2A2A2A' }}
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#D4D4D4"
          strokeWidth={2}
          dot={{ fill: '#D4D4D4', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#FFFFFF' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
