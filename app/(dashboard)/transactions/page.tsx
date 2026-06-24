import { prisma } from "@/lib/prisma";
import TransactionsClient from "@/components/TransactionsClient";

export default async function TransactionsPage() {
  const [transactions, products] = await Promise.all([
    prisma.transaction.findMany({
      include: { product: { select: { nama: true, sku: true, satuan: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      select: { id: true, nama: true, sku: true, stok: true, satuan: true, harga: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Transaksi</h1>
        <p className="text-sm text-gray-500 mt-0.5">Catat stok masuk, pembelian, dan penjualan.</p>
      </div>
      <TransactionsClient initialTransactions={transactions} products={products} />
    </div>
  );
}