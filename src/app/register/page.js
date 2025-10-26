"use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
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
      
      try { localStorage.setItem('name', name); localStorage.setItem('email', email); } catch {}
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-xl p-4 rounded-2xl flex items-start space-x-3 shadow-2xl shadow-red-500/20">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Register Card */}
        <div className="bg-slate-800/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-2xl shadow-primary/50 mb-4">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              สร้างบัญชีใหม่
            </h1>
            <p className="text-slate-400 text-base font-medium">
              เริ่มต้นการจัดการการเงินของคุณ
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                <span>ชื่อ</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-slate-500 group-focus-within:text-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-slate-700 bg-slate-900/50 backdrop-blur-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 outline-none font-medium"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>อีเมล</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-slate-500 group-focus-within:text-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-slate-700 bg-slate-900/50 backdrop-blur-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-slate-500 group-focus-within:text-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-14 pr-14 py-4 rounded-2xl border-2 border-slate-700 bg-slate-900/50 backdrop-blur-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478l-.04-.04zM2 10a7.996 7.996 0 013.716-6.747l1.504 1.504A5.972 5.972 0 0110 5c2.761 0 5 2.239 5 5 0 1.104-.306 2.133-.83 3.012l1.505 1.505C17.136 12.375 18 11.276 18 10c0-4.418-3.582-8-8-8a7.98 7.98 0 00-5.657 2.28L2.293 2.293z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary text-white py-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-2xl shadow-primary/50 hover:shadow-3xl hover:shadow-primary/50 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังสมัครสมาชิก...</span>
                </span>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-slate-800 text-slate-500 font-medium">หรือ</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-400 text-base font-medium">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/login" className="font-black text-primary hover:text-primary/80 transition-colors">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          © 2025 <span className="text-primary font-black">Balanz.IA</span>. สงวนลิขสิทธิ์
        </p>
      </div>
    </div>
  );
}