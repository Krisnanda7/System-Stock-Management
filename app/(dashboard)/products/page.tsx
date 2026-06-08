import { prisma } from "@/lib/prisma";
import ProductsClient from "@/components/ProductsClient";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Produk</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola daftar barang dan stok</p>
      </div>
      <ProductsClient initialProducts={products} />
    </div>
  );
}