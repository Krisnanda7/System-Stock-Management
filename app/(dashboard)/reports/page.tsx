import { prisma } from "@/lib/prisma";
import ReportClient from "@/components/ReportClient";
import StockChart from "@/components/StockChart";
import SalesProfitChart from "@/components/SalesProfitChart";
import { buildWeeklySalesProfitChart, buildWeeklyStockChart } from "@/lib/stockChart";

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

export default async function ReportsPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [totalProducts, totalTransactions, lowStockProducts, recentTransactions, allSalesTransactions, allPurchaseTransactions, lastWeekTransactions, lastWeekSalesTransactions, lastWeekPurchaseTransactions] = await Promise.all([
    prisma.product.count(),
    prisma.transaction.count(),
    prisma.product.findMany({ where: { stok: { lte: 10 } }, orderBy: { stok: "asc" }, take: 10 }),
    prisma.transaction.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { nama: true, sku: true } } },
    }),
    prisma.transaction.findMany({ where: { tipe: "KELUAR" }, select: { jumlah: true, tipe: true, harga: true, createdAt: true } }),
    prisma.transaction.findMany({ where: { tipe: "PEMBELIAN" }, select: { jumlah: true, tipe: true, harga: true, createdAt: true } }),
    prisma.transaction.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, orderBy: { createdAt: "asc" }, select: { jumlah: true, tipe: true, createdAt: true } }),
    prisma.transaction.findMany({ where: { tipe: "KELUAR", createdAt: { gte: sevenDaysAgo } }, orderBy: { createdAt: "asc" }, select: { jumlah: true, tipe: true, harga: true, createdAt: true } }),
    prisma.transaction.findMany({ where: { tipe: "PEMBELIAN", createdAt: { gte: sevenDaysAgo } }, orderBy: { createdAt: "asc" }, select: { jumlah: true, tipe: true, harga: true, createdAt: true } }),
  ]);

  const totalBiayaPembelian = allPurchaseTransactions.reduce((sum, tx) => sum + (tx.harga ?? 0) * tx.jumlah, 0);
  const totalPendapatanPenjualan = allSalesTransactions.reduce((sum, tx) => sum + (tx.harga ?? 0) * tx.jumlah, 0);
  const totalLaba = totalPendapatanPenjualan - totalBiayaPembelian;
  const lowStockCount = lowStockProducts.length;
  const chartData = buildWeeklyStockChart(lastWeekTransactions.map((transaction) => ({
    jumlah: transaction.jumlah,
    tipe: transaction.tipe,
    createdAt: transaction.createdAt,
  })));
  const salesProfitChartData = buildWeeklySalesProfitChart([...lastWeekSalesTransactions, ...lastWeekPurchaseTransactions]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 print:p-0 print:border-0 print:shadow-none">
      <ReportClient />

      <div className="mb-8 print:mb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Laporan Stok</h1>
            <p className="text-sm text-gray-500">Ringkasan kondisi stok dan aktivitas transaksi.</p>
          </div>
          <p className="text-xs text-gray-400">Dicetak pada {formatTanggal(new Date())}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5 mb-8">
        {[
          { label: "Total Produk", value: totalProducts, description: "Jenis produk terdaftar" },
          { label: "Total Transaksi", value: totalTransactions, description: "Jumlah semua transaksi" },
          { label: "Total Biaya Pembelian", value: `Rp ${new Intl.NumberFormat("id-ID").format(totalBiayaPembelian)}`, description: "Total biaya pembelian" },
          { label: "Total Pendapatan", value: `Rp ${new Intl.NumberFormat("id-ID").format(totalPendapatanPenjualan)}`, description: "Total pendapatan penjualan" },
          { label: "Total Laba", value: `Rp ${new Intl.NumberFormat("id-ID").format(totalLaba)}`, description: "Pendapatan dikurangi biaya" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-gray-100 bg-slate-50 p-5 print:border-black/10 print:bg-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-2">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Aktivitas Stok (7 hari)</h2>
          <StockChart data={chartData} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Pendapatan & Laba</h2>
          <p className="text-sm text-gray-500 mb-4">Pendapatan dan biaya pembelian mingguan bersama laba bersih.</p>
          <SalesProfitChart data={salesProfitChartData} />
        </div>
      </div>

      <section className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 print:border-black/10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Produk dengan Stok Rendah ({lowStockCount})</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Semua produk berada di atas batas stok minimum.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-3xl border border-gray-100 bg-slate-50 p-4 print:border-black/10">
                  <p className="font-semibold text-gray-900">{product.nama}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  <p className="mt-3 text-sm text-gray-700">Stok: <strong>{product.stok}</strong></p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 print:border-black/10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-y border-gray-100 hover:bg-gray-50 print:border-black/10">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{transaction.product.nama}</p>
                      <p className="text-xs text-gray-500">{transaction.product.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{transaction.tipe}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{transaction.jumlah}</td>
                    <td className="px-4 py-3 text-gray-500">{formatTanggal(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
