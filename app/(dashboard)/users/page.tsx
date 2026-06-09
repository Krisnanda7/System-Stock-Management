import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UsersClient from "@/components/UsersClient";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola akun pengguna sistem</p>
      </div>
      <UsersClient users={users} currentUserEmail={session?.user?.email ?? ""} />
    </div>
  );
}