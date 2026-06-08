import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "P2002") return NextResponse.json({ error: "SKU sudah digunakan" }, { status: 400 });
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}