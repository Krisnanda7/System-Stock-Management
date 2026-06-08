import { prisma } from "@/lib/prisma";
import StockChart from "@/components/StockChart";
import Link from "next/link";

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

export default async function DashboardPage() {
  const [totalProducts, stokAggregate, stokRendah, recentTransactions] = await Promise.all([
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stok: true } }),
    prisma.product.findMany({
      where: { stok: { lte: 10 } },
      select: { id: true, nama: true, stok: true, stokMinimum: true, sku: true },
    }),
    prisma.transaction.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { nama: true, sku: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan kondisi stok barang</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Produk", value: totalProducts, sub: "jenis barang" },
          { label: "Total Stok", value: stokAggregate._sum.stok ?? 0, sub: "unit tersedia" },
          { label: "Stok Rendah", value: stokRendah.length, sub: "perlu restock" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-3">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Aktivitas Stok (7 hari)</h2>
          <StockChart />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">⚠️ Stok Perlu Restock</h2>
          {stokRendah.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Semua stok aman ✓</p>
          ) : (
            <div className="space-y-3">
              {stokRendah.map((p) => (
                <Link href="/products" key={p.id} className="block">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.nama}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      {p.stok} unit
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Transaksi Terbaru</h2>
          <Link href="/transactions" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-50 bg-gray-50/50">
              <th className="text-left px-5 py-3 font-medium">Produk</th>
              <th className="text-left px-5 py-3 font-medium">Tipe</th>
              <th className="text-right px-5 py-3 font-medium">Jumlah</th>
              <th className="text-right px-5 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">Belum ada transaksi</td></tr>
            )}
            {recentTransactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{t.product.nama}</p>
                  <p className="text-xs text-gray-400">{t.product.sku}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.tipe === "MASUK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {t.tipe === "MASUK" ? "↑ Masuk" : "↓ Keluar"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium">{t.jumlah}</td>
                <td className="px-5 py-3 text-right text-gray-400 text-xs">{formatTanggal(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}