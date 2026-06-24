"use client";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { SalesProfitChartEntry } from "@/lib/stockChart";

export default function SalesProfitChart({ data }: { data: SalesProfitChartEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
        <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value) || 0)}`}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          cursor={{ fill: "#f1f5f9" }}
        />
        <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="biaya" name="Biaya Pembelian" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={10} />
        <Bar dataKey="pendapatan" name="Pendapatan Penjualan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={10} />
        <Line type="monotone" dataKey="laba" name="Laba" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
