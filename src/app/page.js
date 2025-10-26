"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard'; // Redirect ไป dashboard ถ้าล็อกอิน
    }
    setIsLoggedIn(!!token);
  }, []);
//min-h-screen bg-gray-100 flex items-center justify-center
  return (
    <main className="min-h-screen bg-[#191919]">
      {/* Hero Section (dark) */}
      <section className="bg-[#191919] text-[#E8E8E8] min-h-screen">
        {/* Top brand header (desktop) */}
        <div className="w-full px-10 pt-8 hidden md:block">
          <Link href="/" className="text-white font-extrabold text-2xl">Balanz<span className="text-[#E8E8E8]">.IA</span></Link>
        </div>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20 grid grid-cols-12 gap-6 md:gap-12 items-center">
          <div className="col-span-12 md:col-span-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white mb-4">
              ยินดีต้อนรับเข้าสู่ <span className="text-white">Balanz</span><span className="text-[#E8E8E8]">.IA</span>
            </h1>
            <p className="text-[#B5B5B5] mb-3">จัดการการเงินของคุณได้อย่างง่ายดายและมีประสิทธิภาพ</p>
            <p className="text-3xl md:text-4xl font-semibold text-[#F3F3F3] mb-10">
              Manage your finances
              <br /> easily and efficiently
            </p>

            {!isLoggedIn && (
              <div className="flex flex-wrap gap-5">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-lg text-white border-2 border-[#299D91] bg-[#299D91] shadow hover:brightness-110 transition font-bold"
                >
                  เริ่มต้นใช้งาน
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-lg text-[#E8E8E8] border-2 border-[#299D91] hover:bg-[#299D91]/10 transition font-bold"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>

          {/* Hero Illustration */}
          <div className="hidden md:flex justify-center col-span-12 md:col-span-6">
            <img
              src="/Home.png"
              alt="Balanz.IA infographic"
              className="w-[420px] md:w-[520px] h-auto select-none"
              draggable="false"
            />
          </div>
        </div>

        {/* Feature row on dark */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl border-2 border-[#299D91] text-[#299D91] flex items-center justify-center mx-auto mb-3 bg-transparent">
              {/* list icon */}
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 7h12v2H6zM6 11h12v2H6zM6 15h12v2H6z"/>
              </svg>
            </div>
            <p className="text-[#8AD5CD] font-semibold">ติดตามธุรกรรม</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl border-2 border-[#299D91] text-[#299D91] flex items-center justify-center mx-auto mb-3">
              {/* analyze icon */}
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 19h16v2H4z"/>
                <path d="M6 10h3v7H6zM11 6h3v11h-3zM16 12h3v5h-3z"/>
              </svg>
            </div>
            <p className="text-[#8AD5CD] font-semibold">วิเคราะห์การเงิน</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl border-2 border-[#299D91] text-[#299D91] flex items-center justify-center mx-auto mb-3">
              {/* bell icon */}
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2z"/>
                <path d="M18 16V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"/>
              </svg>
            </div>
            <p className="text-[#8AD5CD] font-semibold">การแจ้งเตือน</p>
          </div>
        </div>
      </section>
    </main>
  );
}
