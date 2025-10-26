"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!res.ok) throw new Error(data?.message || `ส่งอีเมลรีเซ็ตไม่สำเร็จ (${res.status})`);
      setSuccess("ส่งลิงก์รีเซ็ตไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย");
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-[#191919]">ลืมรหัสผ่าน</h1>
          <p className="text-center text-[#299D91] font-semibold mt-1">Forgot Password</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            <div>
              <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#299D91] border-2 border-[#299D91] text-white py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>

            <p className="text-center text-sm text-gray-600">
              นึกออกแล้ว? {" "}
              <Link href="/login" className="text-[#299D91] font-semibold hover:underline">กลับไปเข้าสู่ระบบ</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
