"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export default function ProfileClient({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // Form info
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  // Form password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfoLoading(true);
    setInfoSuccess("");
    setInfoError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update profil");
      setInfoSuccess("Profil berhasil diperbarui! Silakan login ulang jika email berubah.");
    } catch (e: any) {
      setInfoError(e.message);
    } finally {
      setInfoLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPassLoading(true);
    setPassSuccess("");
    setPassError("");

    if (newPassword !== confirmPassword) {
      setPassError("Konfirmasi password tidak cocok");
      setPassLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, email: user.email, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal ganti password");
      setPassSuccess("Password berhasil diubah! Silakan login ulang.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 2000);
    } catch (e: any) {
      setPassError(e.message);
    } finally {
      setPassLoading(false);
    }
  }

  function formatTanggal(d: Date) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
  }

  return (
    <div className="max-w-2xl">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 text-2xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                {user.role}
              </span>
              <span className="text-xs text-gray-400">
                Bergabung {formatTanggal(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: "info", label: "Informasi Profil" },
            { key: "password", label: "Ganti Password" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-6 py-3.5 text-sm font-medium transition border-b-2 ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-500 bg-blue-50/30"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tab Info */}
          {activeTab === "info" && (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              {infoError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {infoError}
                </div>
              )}
              {infoSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                  ✓ {infoSuccess}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Role tidak dapat diubah sendiri</p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={infoLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
                >
                  {infoLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}

          {/* Tab Password */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                  ✓ {passSuccess}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Password Saat Ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Ulangi password baru"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                )}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading || newPassword !== confirmPassword}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
                >
                  {passLoading ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}