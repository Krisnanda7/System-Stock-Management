"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

const emptyForm = { name: "", email: "", password: "", role: "STAFF" };
const emptyEditForm = { name: "", email: "", role: "STAFF", newPassword: "", confirmPassword: "" };

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

export default function UsersClient({
  users: initialUsers,
  currentUserEmail,
}: {
  users: User[];
  currentUserEmail: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  // Modal tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  // Hapus
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  function openEdit(u: User) {
    setEditTarget(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, newPassword: "", confirmPassword: "" });
    setEditError("");
    setShowNewPass(false);
    setShowEditModal(true);
  }

  async function refreshUsers() {
    const updated = await fetch("/api/users").then((r) => r.json());
    setUsers(updated);
    router.refresh();
  }

  async function handleAdd() {
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat user");
      setShowAddModal(false);
      setAddForm(emptyForm);
      await refreshUsers();
    } catch (e: any) {
      setAddError(e.message);
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEdit() {
    if (showNewPass && editForm.newPassword !== editForm.confirmPassword) {
      setEditError("Konfirmasi password tidak cocok");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      const payload: any = {
        id: editTarget!.id,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (showNewPass && editForm.newPassword) {
        payload.newPassword = editForm.newPassword;
      }
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update user");
      setShowEditModal(false);
      setEditTarget(null);
      await refreshUsers();
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowAddModal(true); setAddError(""); setAddForm(emptyForm); }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah User
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3">Nama</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Bergabung</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">Belum ada user</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{formatTanggal(u.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Tombol Edit */}
                    <button
                      onClick={() => openEdit(u)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Tombol Hapus — tidak bisa hapus diri sendiri */}
                    {u.email !== currentUserEmail ? (
                      <button
                        onClick={() => setDeleteConfirm(u.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 px-2">Akun kamu</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Tambah User Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{addError}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="input-field" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="input-field" placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="input-field" placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="input-field">
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleAdd} disabled={addLoading || !addForm.name || !addForm.email || !addForm.password}
                className="flex-1 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition">
                {addLoading ? "Menyimpan..." : "Tambah User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{editError}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="input-field" placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Toggle ganti password */}
              <div className="border-t border-gray-100 pt-4">
                <button type="button" onClick={() => { setShowNewPass(!showNewPass); setEditForm({ ...editForm, newPassword: "", confirmPassword: "" }); }}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {showNewPass ? "Batal ganti password" : "Ganti password"}
                </button>

                {showNewPass && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru</label>
                      <input type="password" value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        className="input-field" placeholder="Minimal 6 karakter" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Konfirmasi Password</label>
                      <input type="password" value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                        className="input-field" placeholder="Ulangi password baru" />
                      {editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleEdit}
                disabled={editLoading || !editForm.name || !editForm.email || (showNewPass && editForm.newPassword !== editForm.confirmPassword)}
                className="flex-1 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition">
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Hapus User?</h3>
            <p className="text-sm text-gray-500 mb-6">User tidak akan bisa login setelah dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}