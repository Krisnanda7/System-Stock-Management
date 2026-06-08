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
    const { productId, tipe, jumlah, catatan } = await req.json();
    if (!["MASUK", "KELUAR"].includes(tipe)) return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
    if (tipe === "KELUAR") {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product || product.stok < jumlah) return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({ data: { productId, tipe, jumlah, catatan } }),
      prisma.product.update({ where: { id: productId }, data: { stok: { increment: tipe === "MASUK" ? jumlah : -jumlah } } }),
    ]);
    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}