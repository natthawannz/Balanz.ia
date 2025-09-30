"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard"; // Redirect ไป dashboard ถ้าล็อกอินแล้ว
    }
  }, []);

  return (
    <main className="container mx-auto px-6 py-8 min-h-screen flex flex-col justify-center items-center">
      {/* Logo Section */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">
          <Image
            src="/logo2.png" // วางไฟล์ไว้ที่ public/logo2.png
            alt="SAVEi Logo"
            width={200}  // ✅ ปรับจาก 200 → 280
            height={280} // ✅ ปรับจาก 200 → 280
            priority
          />
        </div>
        <p className="text-gray-700 text-lg mb-8">เริ่มจดรายรับรายจ่ายกันเลย!</p>

        {/* Buttons */}
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-cyan-600 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="bg-white text-cyan-600 border border-cyan-400 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            ลงทะเบียน
          </Link>
        </div>
      </div>
    </main>
  );
}