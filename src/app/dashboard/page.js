"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    transactionCount: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirect ถ้ายังไม่ล็อกอิน
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error((await res.json()).message || 'Failed to fetch transactions');
        }     
        const transactions = await res.json();
        console.log('Fetched transactions:', transactions); // ตรวจสอบข้อมูลที่ดึงมา
        const sortedTransactions = transactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ); // เรียงลำดับจากล่าสุด
        const totalIncome = sortedTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = sortedTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        setStats({
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          transactionCount: transactions.length,
          recentTransactions: sortedTransactions.slice(0, 3), // 3 รายการล่าสุด
        });
        setLoading(false);
      } catch (error) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const showAlert = (action) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">คุณเลือก: ${action}</h3>
          <p class="text-gray-600 mb-6">ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้!</p>
          <button onclick="this.closest('.fixed').remove()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            ตกลง
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

return (
  <main className="container mx-auto px-6 py-8 min-h-screen">
    {/* Stats Cards */}
    {error ? (
      <p className="text-red-600 mb-8">{error}</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Card */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">รายรับทั้งหมด</p>
              <p className="text-4xl font-extrabold text-[#2563eb] drop-shadow">{loading ? '...' : `${stats.totalIncome.toLocaleString()} ฿`}</p>
            </div>
            <div className="bg-gradient-to-br from-[#38bdf8] to-[#6366f1] p-4 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Card */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">รายจ่ายทั้งหมด</p>
              <p className="text-4xl font-extrabold text-[#ef4444] drop-shadow">{loading ? '...' : `${stats.totalExpenses.toLocaleString()} ฿`}</p>
            </div>
            <div className="bg-gradient-to-br from-[#fbbf24] to-[#ef4444] p-4 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Card */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">เงินออมสุทธิ</p>
              <p className="text-4xl font-extrabold text-[#f59e42] drop-shadow">{loading ? '...' : `${stats.netSavings.toLocaleString()} ฿`}</p>
            </div>
            <div className="bg-gradient-to-br from-[#fde68a] to-[#f59e42] p-4 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Card */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">จำนวนธุรกรรม</p>
              <p className="text-4xl font-extrabold text-[#a78bfa] drop-shadow">{loading ? '...' : stats.transactionCount}</p>
            </div>
            <div className="bg-gradient-to-br from-[#a78bfa] to-[#6366f1] p-4 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Action Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <div className="group bg-gradient-to-br from-[#e0e7ff] to-[#f0fdfa] rounded-2xl shadow-xl p-8 cursor-pointer border border-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300" onClick={() => window.location.href = '/transactions/add'}>
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#38bdf8] to-[#6366f1] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">เพิ่มธุรกรรม</h3>
          <p className="text-gray-500">บันทึกรายรับหรือรายจ่ายใหม่</p>
        </div>
      </div>
      <div className="group bg-gradient-to-br from-[#f0fdfa] to-[#e0e7ff] rounded-2xl shadow-xl p-8 cursor-pointer border border-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300" onClick={() => window.location.href = '/analytics'}>
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#34d399] to-[#22d3ee] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ดูรายงาน</h3>
          <p className="text-gray-500">ตรวจสอบสถิติการเงิน</p>
        </div>
      </div>
      <div className="group bg-gradient-to-br from-[#fef9c3] to-[#e0e7ff] rounded-2xl shadow-xl p-8 cursor-pointer border border-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300" onClick={() => window.location.href = '/profile'}>
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#a78bfa] to-[#f472b6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ตั้งค่า</h3>
          <p className="text-gray-500">จัดการการตั้งค่าระบบ</p>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
        <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
        </svg>
        ธุรกรรมล่าสุด
      </h3>
      {loading ? (
        <p className="text-gray-600">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : stats.recentTransactions.length === 0 ? (
        <p className="text-gray-600">ไม่มีธุรกรรมล่าสุด</p>
      ) : (
        <div className="space-y-6">
          {stats.recentTransactions.map((txn) => (
            <div key={txn._id} className="flex items-center space-x-5 p-5 bg-gradient-to-r from-[#f0fdfa] to-[#e0e7ff] rounded-xl shadow hover:scale-[1.02] transition-transform">
              <div className={txn.type === 'income' ? 'bg-gradient-to-br from-[#34d399] to-[#22d3ee] p-3 rounded-full' : 'bg-gradient-to-br from-[#fbbf24] to-[#ef4444] p-3 rounded-full'}>
                <svg className={`w-6 h-6 text-white`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {txn.type === 'income' ? 'เพิ่มรายรับ' : 'เพิ่มรายจ่าย'}: <span className="text-[#2563eb]">{txn.category.name}</span> <span className="text-[#ef4444]">({txn.amount.toLocaleString()} ฿)</span>
                </p>
                <p className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </main>
);
}