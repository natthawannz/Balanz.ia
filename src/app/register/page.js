"use client";
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Failed to register');
      }
    } catch (error) {
      setError('Failed to register');
    }
  };

  return (
    <div className=" bg-[#BDF2F4] flex items-center justify-center p-4 rounded-lg">
      <Head>
        <title>Register - SAVEi</title>
      </Head>
      <div className="bg-white white:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SAVEi Logo" width={80} height={80} className="object-contain" />
        </div>
        <h1 style={{ color: '#00C8D2' }} className="text-3xl font-bold text-center mb-6">
          สมัครสมาชิก
        </h1>
        {error && <p className="text-red-600 white:text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 white:text-gray-300 mb-1">ชื่อ</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 white:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 white:focus:ring-green-400 bg-white white:bg-gray-700 text-gray-900 white:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 white:text-gray-300 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 white:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 white:focus:ring-green-400 bg-white white:bg-gray-700 text-gray-900 white:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 white:text-gray-300 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 white:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 white:focus:ring-green-400 bg-white white:bg-gray-700 text-gray-900 white:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors duration-200 white:bg-green-500 white:hover:bg-green-600"
          >
            สมัครสมาชิก
          </button>
          <p className="text-center text-gray-600 white:text-gray-400">
            มีบัญชีอยู่แล้ว? <Link href="/login" className="text-green-600 white:text-green-400 hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}