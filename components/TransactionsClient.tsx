"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: number; tipe: string; jumlah: number; catatan: string | null; createdAt: Date;
  product: { nama: string; sku: string; satuan: string };
}
interface Product { id: number; nama: string; sku: string; stok: number; satuan: string; }

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

export default function TransactionsClient({ initialTransactions, products }: { initialTransactions: Transaction[]; products: Product[] }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [form, setForm] = useState({ productId: "", tipe: "MASUK", jumlah: 1, catatan: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("SEMUA");

  const selectedProduct = products.find(p => p.id === Number(form.productId));
  const filtered = transactions.filter(t => filter === "SEMUA" ? true : t.tipe === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) return setError("Pilih produk terlebih dahulu");
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: Number(form.productId), tipe: form.tipe, jumlah: Number(form.jumlah), catatan: form.catatan || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal menyimpan"); }
      setSuccess(`Berhasil mencatat stok ${form.tipe.toLowerCase()}!`);
      setForm({ productId: "", tipe: "MASUK", jumlah: 1, catatan: "" });
      const updated = await fetch("/api/transactions").then(r => r.json());
      setTransactions(updated);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Catat Transaksi</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-4">✓ {success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Tipe Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                {["MASUK", "KELUAR"].map(t => (
                  <button key={t} type="button" onClick={() => setForm({...form, tipe: t})}
                    className={"py-2.5 rounded-lg text-sm font-medium transition border " + (form.tipe === t ? (t === "MASUK" ? "bg-green-500 text-white border-green-500" : "bg-red-500 text-white border-red-500") : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
                    {t === "MASUK" ? "↑ Stok Masuk" : "↓ Stok Keluar"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Produk</label>
              <select value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} required className="input-field">
                <option value="">— Pilih Produk —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nama} (Stok: {p.stok} {p.satuan})</option>)}
              </select>
            </div>
            {selectedProduct && (
              <div className={"text-xs rounded-lg px-3 py-2 " + (selectedProduct.stok <= 10 ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200")}>
                Stok saat ini: <strong>{selectedProduct.stok} {selectedProduct.satuan}</strong>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah</label>
              <input type="number" min={1} value={form.jumlah} onChange={e => setForm({...form, jumlah: Number(e.target.value)})} required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catatan (opsional)</label>
              <textarea value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} rows={2} className="input-field resize-none" placeholder="Keterangan tambahan..." />
            </div>
            <button type="submit" disabled={loading}
              className={"w-full py-2.5 text-sm font-medium text-white rounded-lg transition " + (form.tipe === "MASUK" ? "bg-green-500 hover:bg-green-600 disabled:opacity-50" : "bg-red-500 hover:bg-red-600 disabled:opacity-50")}>
              {loading ? "Menyimpan..." : `Simpan ${form.tipe === "MASUK" ? "Stok Masuk" : "Stok Keluar"}`}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Riwayat Transaksi</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {["SEMUA", "MASUK", "KELUAR"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={"text-xs px-3 py-1.5 rounded-md font-medium transition " + (filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium">Produk</th>
                <th className="text-left px-5 py-3 font-medium">Tipe</th>
                <th className="text-right px-5 py-3 font-medium">Jumlah</th>
                <th className="text-left px-5 py-3 font-medium">Catatan</th>
                <th className="text-right px-5 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">Belum ada transaksi</td></tr>}
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3"><p className="font-medium text-gray-900">{t.product.nama}</p><p className="text-xs text-gray-400">{t.product.sku}</p></td>
                  <td className="px-5 py-3">
                    <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium " + (t.tipe === "MASUK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {t.tipe === "MASUK" ? "↑" : "↓"} {t.tipe}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">{t.jumlah} <span className="text-xs font-normal text-gray-400">{t.product.satuan}</span></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{t.catatan || "—"}</td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">{formatTanggal(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">{filtered.length} transaksi</div>
        </div>
      </div>
    </div>
  );
}