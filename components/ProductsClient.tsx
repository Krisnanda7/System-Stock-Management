"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number; nama: string; sku: string; kategori: string;
  harga: number; stok: number; stokMinimum: number; satuan: string; deskripsi?: string | null;
}
const emptyForm = { nama: "", sku: "", kategori: "", harga: 0, stok: 0, stokMinimum: 10, satuan: "pcs", deskripsi: "" };

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = products.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setEditProduct(null); setForm(emptyForm); setError(""); setShowModal(true); }
  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ nama: p.nama, sku: p.sku, kategori: p.kategori, harga: p.harga, stok: p.stok, stokMinimum: p.stokMinimum, satuan: p.satuan, deskripsi: p.deskripsi ?? "" });
    setError(""); setShowModal(true);
  }

  async function handleSubmit() {
    setLoading(true); setError("");
    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
      const method = editProduct ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, harga: Number(form.harga), stok: Number(form.stok), stokMinimum: Number(form.stokMinimum) }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal menyimpan"); }
      setShowModal(false);
      const updated = await fetch("/api/products").then(r => r.json());
      setProducts(updated);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk, SKU, kategori..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3">Produk</th>
              <th className="text-left px-5 py-3">SKU</th>
              <th className="text-left px-5 py-3">Kategori</th>
              <th className="text-right px-5 py-3">Harga</th>
              <th className="text-right px-5 py-3">Stok</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">{search ? "Produk tidak ditemukan" : "Belum ada produk"}</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                <td className="px-5 py-3"><p className="font-medium text-gray-900">{p.nama}</p><p className="text-xs text-gray-400">{p.satuan}</p></td>
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
                <td className="px-5 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{p.kategori}</span></td>
                <td className="px-5 py-3 text-right text-gray-900">{formatRupiah(p.harga)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={"font-semibold text-xs px-2 py-0.5 rounded " + (p.stok <= p.stokMinimum ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                    {p.stok} {p.satuan}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">{filtered.length} produk ditampilkan</div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editProduct ? "Edit Produk" : "Tambah Produk"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Nama Produk</label><input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="input-field" placeholder="Contoh: Kemeja Polos" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">SKU</label><input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input-field" placeholder="KMJ-001" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label><input type="text" value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="input-field" placeholder="Pakaian" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Harga (Rp)</label><input type="number" value={form.harga} onChange={e => setForm({...form, harga: Number(e.target.value)})} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Satuan</label><input type="text" value={form.satuan} onChange={e => setForm({...form, satuan: e.target.value})} className="input-field" placeholder="pcs" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Stok Awal</label><input type="number" value={form.stok} onChange={e => setForm({...form, stok: Number(e.target.value)})} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Stok Minimum</label><input type="number" value={form.stokMinimum} onChange={e => setForm({...form, stokMinimum: Number(e.target.value)})} className="input-field" /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi (opsional)</label><textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="input-field resize-none" rows={2} /></div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSubmit} disabled={loading || !form.nama || !form.sku} className="flex-1 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition">
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}