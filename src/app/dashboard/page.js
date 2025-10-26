"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('ผู้ใช้');
  const [notificationCount, setNotificationCount] = useState(0);

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getMonths = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() + 543;
    const currentMonth = currentDate.getMonth();
    const months = [];
    for (let i = -19; i <= 19; i++) { 
      const monthIndex = (currentMonth + i + 12) % 12;
      const yearOffset = Math.floor((currentMonth + i) / 12);
      const year = currentYear + yearOffset;
      months.push(`${monthNames[monthIndex]} ${year}`);
    }
    return months;
  };

  const months = getMonths();
  const currentDate = new Date();
  const currentMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`;
  const currentMonthInitialIndex = months.findIndex(m => m === currentMonthYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentMonthInitialIndex >= 0 ? currentMonthInitialIndex : 0);
  const selectedMonth = months[currentMonthIndex];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('name') || localStorage.getItem('displayName');
    if (storedName) setDisplayName(storedName);

    const fetchBadge = async () => {
      try {
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/check-budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        let data; 
        try { data = JSON.parse(raw); } catch { data = {}; }
        if (res.ok) setNotificationCount(data.alertCount || 0);
      } catch {}
    };
    fetchBadge();

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error((await res.json()).message || 'Failed to fetch transactions');
        }     
        const transactions = await res.json();
        const filteredTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          const tMonthYear = `${monthNames[tDate.getMonth()]} ${tDate.getFullYear() + 543}`;
          return tMonthYear === selectedMonth;
        });

        const sortedTransactions = filteredTransactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const totalIncome = filteredTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = filteredTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        setStats({
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          recentTransactions: sortedTransactions.slice(0, 3),
        });
        setLoading(false);
      } catch (error) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
        setLoading(false);
      }
    };

    fetchStats();
    
    const interval = setInterval(() => {
      const newDate = new Date();
      const newMonthYear = `${monthNames[newDate.getMonth()]} ${newDate.getFullYear() + 543}`;
      if (newMonthYear !== selectedMonth.split(' ')[0] + ' ' + (parseInt(selectedMonth.split(' ')[1]) - 543)) {
        fetchStats();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedMonth]);

  const formatDate = () => {
    const d = new Date();
    const monthNamesTh = [
      'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
    ];
    const m = monthNamesTh[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    return `${m} ${day}, ${year}`;
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header - ตรงกับภาพ */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Hello {displayName}
          </h1>
          <p className="text-sm text-slate-500">{formatDate()}</p>
        </div>

        {/* Month Navigation - ตรงตามภาพ */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Month</p>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 flex items-center justify-between max-w-xs">
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 0))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="เดือนก่อนหน้า"
            >
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="text-center px-4">
              <span className="text-lg font-semibold text-[#299D91]">{selectedMonth.split(' ')[0]}</span>
            </div>
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : months.length - 1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="เดือนถัดไป"
            >
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Cards - เหมือนภาพ 100% */}
        {error ? (
          <p className="text-red-600 mb-8 p-4 bg-red-50 rounded-lg">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Income Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-xs text-slate-500 mb-1">Income</p>
              <p className="text-[10px] text-slate-400 mb-4">รายรับทั้งหมด (ต่อเดือน)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#299D91]">
                  {loading ? '0' : stats.totalIncome.toLocaleString()}
                </span>
                <span className="text-2xl font-semibold text-[#299D91]">฿</span>
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-xs text-slate-500 mb-1">Expense</p>
              <p className="text-[10px] text-slate-400 mb-4">รายจ่ายทั้งหมด (ต่อเดือน)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#FF6B6B]">
                  {loading ? '0' : stats.totalExpenses.toLocaleString()}
                </span>
                <span className="text-2xl font-semibold text-[#FF6B6B]">฿</span>
              </div>
            </div>

            {/* Net Balance Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-xs text-slate-500 mb-1">Net Balance</p>
              <p className="text-[10px] text-slate-400 mb-4">ยอดคงเหลือสุทธิ (ต่อเดือน)</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${stats.netSavings >= 0 ? 'text-[#FFD93D]' : 'text-[#FF6B6B]'}`}>
                  {loading ? '0' : Math.abs(stats.netSavings).toLocaleString()}
                </span>
                <span className={`text-2xl font-semibold ${stats.netSavings >= 0 ? 'text-[#FFD93D]' : 'text-[#FF6B6B]'}`}>฿</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Add Button - เหมือนภาพ */}
        <button
          onClick={() => (window.location.href = '/transactions/add')}
          className="fixed right-8 bottom-8 w-16 h-16 rounded-full bg-[#299D91] shadow-lg text-white flex items-center justify-center hover:bg-[#238A80] transition-all duration-300 hover:scale-110 z-50"
          aria-label="เพิ่มรายการ"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </button>

        {/* Recent Transactions - เหมือนภาพ */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">Recent Transactions</p>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#299D91] mb-6">ธุรกรรมล่าสุด</h3>
            
            {loading ? (
              <p className="text-slate-500 text-center py-8">กำลังโหลด...</p>
            ) : error ? (
              <p className="text-red-600 text-center py-8">{error}</p>
            ) : stats.recentTransactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">ไม่มีธุรกรรมล่าสุด</p>
            ) : (
              <div className="space-y-1">
                {stats.recentTransactions.map((txn, index) => (
                  <div 
                    key={txn._id} 
                    className={`flex items-center justify-between py-4 ${
                      index !== stats.recentTransactions.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    {/* Left: Icon + Details */}
                    <div className="flex items-center gap-4">
                      {/* Category Icon */}
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {txn.category?.name?.charAt(0).toUpperCase() || 'T'}
                        </span>
                      </div>
                      
                      {/* Transaction Info */}
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {txn.category?.name || 'หมวดหมู่ไม่ระบุ'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(txn.createdAt).toLocaleDateString('th-TH', { 
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className={`text-sm font-semibold ${
                      txn.type === 'income' ? 'text-[#299D91]' : 'text-[#FF6B6B]'
                    }`}>
                      {txn.type === 'expense' ? '-' : '+'}{txn.amount.toLocaleString()} บาท
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}