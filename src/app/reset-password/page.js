"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("ไม่พบโทเค็นรีเซ็ตรหัสผ่านจากลิงก์อีเมล");
      return;
    }
    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!res.ok) throw new Error(data?.message || `ตั้งรหัสผ่านใหม่ไม่สำเร็จ (${res.status})`);
      setSuccess("ตั้งรหัสผ่านใหม่สำเร็จ คุณสามารถเข้าสู่ระบบได้แล้ว");
      setTimeout(() => (window.location.href = "/login"), 1200);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#191919] text-gray-100">
      {/* Top brand like Home */}
      <div className="max-w-6xl mx-auto px-6 pt-8 hidden md:block">
        <Link href="/" className="text-white font-extrabold text-2xl">
          Balanz<span className="text-[#E8E8E8]">.IA</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14 min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md sm:max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-[#191919]">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-center text-[#299D91] font-semibold mt-1">Reset Password</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            {!token && (
              <div className="text-yellow-600 text-sm">ลิงก์นี้ไม่ถูกต้องหรือหมดอายุ</div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-[#299D91] border-2 border-[#299D91] text-white py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
            </button>

            <p className="text-center text-sm text-gray-600">
              มีบัญชีอยู่แล้ว? {" "}
              <Link href="/login" className="text-[#299D91] font-semibold hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
