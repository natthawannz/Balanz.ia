"use client";
import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/components/AuthCard';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      // รองรับทั้ง JSON และข้อความดิบ กรณีเซิร์ฟเวอร์ส่งไม่ถูกต้อง
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      console.log('Login response:', data);
      if (res.ok) {
        // รองรับหลายรูปแบบของชื่อฟิลด์ token จาก backend
        const token = (
          data?.token ||
          data?.accessToken ||
          data?.access_token ||
          data?.jwt ||
          data?.data?.token ||
          data?.user?.token
        );

        if (!token) {
          throw new Error('ไม่พบโทเค็นจากเซิร์ฟเวอร์');
        }

        localStorage.setItem('token', token);
        const nameFromApi = data?.name || data?.user?.name || data?.user?.displayName;
        const emailFromApi = data?.email || data?.user?.email;
        if (nameFromApi) {
          try { localStorage.setItem('name', nameFromApi); } catch {}
        }
        if (emailFromApi) {
          try { localStorage.setItem('email', emailFromApi); } catch {}
        }
        window.location.href = '/dashboard';
      } else {
        const msgFromServer = data?.message;
        const msg = res.status >= 500
          ? `เซิร์ฟเวอร์ขัดข้อง (${res.status})`
          : (msgFromServer || `เข้าสู่ระบบไม่สำเร็จ (${res.status})`);
        setError(msg);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('เข้าสู่ระบบไม่สำเร็จ: ' + (error?.message || 'ไม่ทราบสาเหตุ'));
    }
  };

  return (
    <AuthCard>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="border-2 border-[#4db8a8] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
            <input
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="border-2 border-[#4db8a8] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="text-right mt-2">
            <Link href="/forgot-password" className="text-[#4db8a8] hover:text-[#3d9888] text-sm font-medium transition-colors">
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#4db8a8] hover:bg-[#3d9888] text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg">
          เข้าสู่ระบบ
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 text-sm">
          ยังไม่มีบัญชีใช่ไหม?
          <Link href="/register" className="text-[#4db8a8] hover:text-[#3d9888] font-semibold ml-1 transition-colors">สมัครสมาชิก</Link>
        </p>
      </div>
    </AuthCard>
  );
}
