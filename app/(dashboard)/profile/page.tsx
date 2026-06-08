import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola informasi akun kamu</p>
      </div>
      <ProfileClient user={user!} />
    </div>
  );
}