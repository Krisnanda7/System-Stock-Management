import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  try {
    const body = await req.json();
    const product = await prisma.product.update({ where: { id: Number(id) }, data: body });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}