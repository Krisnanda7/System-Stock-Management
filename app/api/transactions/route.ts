import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const transactions = await prisma.transaction.findMany({
    include: { product: { select: { nama: true, sku: true, satuan: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const jumlah = Number(body.jumlah);
    const tipe = body.tipe;
    const catatan = body.catatan ?? null;
    const harga = body.harga != null ? Number(body.harga) : null;

    if (!["PEMBELIAN", "MASUK", "KELUAR"].includes(tipe)) return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
    if (!productId || !jumlah || jumlah <= 0) return NextResponse.json({ error: "Jumlah transaksi tidak valid" }, { status: 400 });
    if ((tipe === "PEMBELIAN" || tipe === "KELUAR") && (!harga || harga <= 0)) {
      return NextResponse.json({ error: "Harga per item harus diisi dan lebih besar dari nol" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 400 });
    if (tipe === "KELUAR" && product.stok < jumlah) return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({ data: { productId, tipe, jumlah, harga: tipe === "MASUK" ? null : harga, catatan } }),
      prisma.product.update({ where: { id: productId }, data: { stok: { increment: tipe === "KELUAR" ? -jumlah : jumlah } } }),
    ]);
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}