"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { hari: "Sen", masuk: 45, keluar: 30 },
  { hari: "Sel", masuk: 20, keluar: 55 },
  { hari: "Rab", masuk: 80, keluar: 25 },
  { hari: "Kam", masuk: 15, keluar: 40 },
  { hari: "Jum", masuk: 60, keluar: 35 },
  { hari: "Sab", masuk: 35, keluar: 20 },
  { hari: "Min", masuk: 10, keluar: 15 },
];

export default function StockChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-48 bg-gray-50 animate-pulse rounded-lg" />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={10} barGap={4}>
        <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} cursor={{ fill: "#f1f5f9" }} />
        <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="masuk" name="Stok Masuk" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="keluar" name="Stok Keluar" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}