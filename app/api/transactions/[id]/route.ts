import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const transactionId = Number(id);
  if (!transactionId) return NextResponse.json({ error: "ID transaksi tidak valid" }, { status: 400 });

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });

  const stockChange = transaction.tipe === "KELUAR" ? transaction.jumlah : -transaction.jumlah;

  const [deletedTransaction] = await prisma.$transaction([
    prisma.transaction.delete({ where: { id: transactionId } }),
    prisma.product.update({ where: { id: transaction.productId }, data: { stok: { increment: stockChange } } }),
  ]);

  return NextResponse.json(deletedTransaction, { status: 200 });
}
