// ...existing code...
"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!res.ok) throw new Error(data.message || `สมัครสมาชิกไม่สำเร็จ (${res.status})`);
      // เก็บชื่อที่ผู้ใช้กรอกไว้เพื่อให้แสดงในแถบเมื่อเข้าสู่ระบบสำเร็จภายหลัง
      try { localStorage.setItem('name', name); localStorage.setItem('email', email); } catch {}
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <AuthCard leftSubtitle="Create your account">
      <h1 className="text-2xl font-extrabold text-center text-[#191919] mb-2">สมัครสมาชิก</h1>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="border-2 border-[#4db8a8] rounded-xl p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="ชื่อ"
            autoComplete="name"
            className="w-full outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="border-2 border-[#4db8a8] rounded-xl p-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="อีเมล"
            autoComplete="email"
            className="w-full outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="border-2 border-[#4db8a8] rounded-xl p-4">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            autoComplete="new-password"
            className="w-full outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <button type="submit" className="w-full bg-[#4db8a8] hover:bg-[#3d9888] text-white py-4 rounded-xl font-semibold shadow-lg transition">
          สมัครสมาชิก
        </button>
        <p className="text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-[#4db8a8] font-semibold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </AuthCard>
  );
}
// ...existing code...
