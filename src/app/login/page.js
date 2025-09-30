"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Failed to login');
      }
    } catch (error) {
      setError('Failed to login: ' + error.message);
    }
  };

  return (
<main className="bg-app-gradient min-h-screen flex items-center justify-center">
  <div className="glass-card p-10 w-full max-w-md animate-fade-in">
    <div className="flex justify-center mb-6">
      <Image src="/logo.png" alt="Logo" width={80} height={80} />
    </div>
        <h1 className="text-3xl font-extrabold text-center mb-6 text-[#00C8D2] drop-shadow">ยินดีต้อนรับสู่ SAVEi</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C8D2] bg-white text-gray-900 shadow transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C8D2] bg-white text-gray-900 shadow transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#38bdf8] to-[#00C8D2] text-white p-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform duration-200"
          >
            เข้าสู่ระบบ
          </button>
          <p className="text-center text-gray-600">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-[#00C8D2] hover:underline font-semibold">
              สมัครสมาชิก
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}