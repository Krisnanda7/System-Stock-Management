"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { StockChartEntry } from "@/lib/stockChart";

const fallbackData: StockChartEntry[] = [
  { hari: "Sen", masuk: 45, keluar: 30, pembelian: 12 },
  { hari: "Sel", masuk: 20, keluar: 55, pembelian: 18 },
  { hari: "Rab", masuk: 80, keluar: 25, pembelian: 24 },
  { hari: "Kam", masuk: 15, keluar: 40, pembelian: 8 },
  { hari: "Jum", masuk: 60, keluar: 35, pembelian: 20 },
  { hari: "Sab", masuk: 35, keluar: 20, pembelian: 14 },
  { hari: "Min", masuk: 10, keluar: 15, pembelian: 6 },
];

export default function StockChart({ data }: { data?: StockChartEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data ?? fallbackData} barSize={10} barGap={4}>
        <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} cursor={{ fill: "#f1f5f9" }} />
        <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="pembelian" name="Pembelian" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="masuk" name="Stok Masuk" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="keluar" name="Stok Keluar" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}