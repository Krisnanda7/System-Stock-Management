import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const product = await prisma.product.update({ where: { id: Number(params.id) }, data: body });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}