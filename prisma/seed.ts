import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.iisslbxxqdwwdcfwunrz:StokApp2024secure@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
    },
  },
});

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@stokapp.com" },
    update: {},
    create: { email: "admin@stokapp.com", password: hashed, name: "Admin", role: "ADMIN" },
  });

  const products = [
    { nama: "Kemeja Polos Putih", sku: "KMJ-001", kategori: "Pakaian", harga: 85000, stok: 150, stokMinimum: 20, satuan: "pcs" },
    { nama: "Celana Jeans Slim", sku: "CLN-001", kategori: "Pakaian", harga: 175000, stok: 8, stokMinimum: 15, satuan: "pcs" },
    { nama: "Sepatu Sneakers", sku: "SPT-001", kategori: "Alas Kaki", harga: 320000, stok: 45, stokMinimum: 10, satuan: "pasang" },
    { nama: "Tas Ransel", sku: "TAS-001", kategori: "Aksesori", harga: 210000, stok: 5, stokMinimum: 8, satuan: "pcs" },
    { nama: "Topi Baseball", sku: "TOP-001", kategori: "Aksesori", harga: 65000, stok: 80, stokMinimum: 15, satuan: "pcs" },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log("✅ Seed selesai!");
}

main().catch(console.error).finally(() => prisma.$disconnect());