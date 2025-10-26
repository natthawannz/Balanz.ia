"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Define the primary color constants (Teal theme)
const PRIMARY_COLOR_LIGHT = '#4db8a8';
const PRIMARY_COLOR_DARK = '#299D91';
const INCOME_COLOR = '#4CAF50'; // Green
const EXPENSE_COLOR = '#FF6B6B'; // Red
const NET_SAVING_COLOR = '#FF9800'; // Orange/Amber

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

  /* --- Data & Logic Setup --- */

  const getMonths = () => {
    const currentDate = new Date();
    // Assuming you want years in Thai Buddhist year (B.E. 2567 = A.D. 2024 + 543)
    const currentYear = currentDate.getFullYear() + 543; 
    const currentMonth = currentDate.getMonth();
    const months = [];
    const span = 12; // Adjusted span to reduce the size for simple testing, can be changed back to 19

    for (let i = -span; i <= span; i++) { 
      const monthIndex = (currentMonth + i) % 12; // Allows negative indexing
      // Adjust year relative to month index
      let yearOffset = Math.floor((currentMonth + i) / 12);
      if (monthIndex < 0) {
        yearOffset -= 1; 
      }
      const actualMonthIndex = (monthIndex + 12) % 12;
      const year = currentYear + yearOffset;
      months.push(`${monthNames[actualMonthIndex]} ${year}`);
    }
    return months;
  };

  const months = getMonths();
  const currentDate = new Date();
  const currentMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`;
  
  // Find the exact current month index among the generated list
  const currentMonthInitialIndex = months.findIndex(m => m === currentMonthYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentMonthInitialIndex !== -1 ? currentMonthInitialIndex : Math.floor(months.length / 2));
  const selectedMonth = months[currentMonthIndex];


  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('name') || localStorage.getItem('displayName');
    if (storedName) setDisplayName(storedName);

    // Function to calculate Thai Buddhist Year from a Date object
    const getThaiYear = (date) => date.getFullYear() + 543;

    const fetchBadge = async () => {
      // Logic for fetching budget alert badge remains here
      try {
        if (!token) return;
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/check-budget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        let data; 
        try { data = JSON.parse(raw); } catch { data = {}; }
        if (res.ok) setNotificationCount(data.alertCount || 0);
      } catch {}
    };

    const fetchStats = async () => {
      setLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error((await res.json()).message || 'Failed to fetch transactions');
        }     
        const transactions = await res.json();
        
        // Filter transactions based on the selectedMonth (T.H. year)
        const selectedMonthName = selectedMonth.split(' ')[0];
        const selectedYear = selectedMonth.split(' ')[1];

        const filteredTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          const tMonthIndex = tDate.getMonth();
          const tYear = getThaiYear(tDate);
          
          return monthNames[tMonthIndex] === selectedMonthName && tYear.toString() === selectedYear;
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
          recentTransactions: sortedTransactions.slice(0, 5), // Show up to 5 recent
        });
        setError('');
        
      } catch (error) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (error.message || 'Error'));
        setStats({ totalIncome: 0, totalExpenses: 0, netSavings: 0, recentTransactions: [] }); // Clear old data on error
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
        // Redirection if not authenticated (basic check)
        window.location.href = '/login';
        return;
    }

    fetchBadge();
    fetchStats();
    
    // Interval logic cleanup remains the same, adjusted slightly for clarity of scope
    // Note: The original interval comparison logic was complex due to mixing AD and BE years, simplified here.
    return () => {}; // Cleanup function
  }, [selectedMonth]); // Dependency on selectedMonth ensures data refetch when month changes

  const formatCurrentDate = () => {
    const d = new Date();
    const m = monthNames[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear() + 543;
    return `${m} ${day}, ${year}`;
  };
  
  const getIconForType = (type) => {
      // Simple icon retrieval based on transaction type
      return type === 'income' ? 
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-6.832 0-11 3.208-11 7 0 1.258.8 2.378 1.942 3.864M12 17a5 5 0 100-10 5 5 0 000 10zM12 11V7m0 8h.01"></path></svg> 
          : 
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>;
  };
  
  const getNetSavingColorClass = (netSavings) => {
    if (netSavings > 0) return `text-[${INCOME_COLOR}]`; // Green for surplus
    if (netSavings < 0) return `text-[${EXPENSE_COLOR}]`; // Red for deficit
    return `text-[${NET_SAVING_COLOR}]`; // Orange for zero
  }

  /* --- JSX Rendering Starts Here --- */

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Greetings */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">
              สวัสดี {displayName}
            </h1>
            <p className="text-sm text-slate-500 font-medium">{formatCurrentDate()}</p>
          </div>
          
          {/* Notification Badge */}
          <Link href="/alerts" className="relative p-3 rounded-full bg-white shadow hover:bg-gray-100 transition duration-150">
             <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
             {notificationCount > 0 && (
                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                     {notificationCount > 9 ? '9+' : notificationCount}
                 </span>
             )}
          </Link>
        </div>

        {/* Month Navigation Panel */}
        <div className="mb-10 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <p className="text-xs text-slate-500  mb-3 uppercase tracking-wide font-semibold">สรุปผลเดือน</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 0))}
              className="p-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
              disabled={currentMonthIndex === 0}
              aria-label="เดือนก่อนหน้า"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
            
            <div className="text-center">
              <span style={{ color: PRIMARY_COLOR_DARK }} className="text-xl font-bold">
                {selectedMonth}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : months.length - 1))}
              className="p-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
              disabled={currentMonthIndex === months.length - 1}
              aria-label="เดือนถัดไป"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {error && (
          <p className="text-red-600 mb-8 p-4 bg-red-100 border border-red-300 rounded-xl font-medium">{error}</p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          
          {/* Income Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-green-400/50 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
               <p className="text-lg font-semibold text-slate-700">รายรับรวม</p>
               <div className="p-2 rounded-full bg-green-100 text-green-600">
                   {getIconForType('income')}
               </div>
            </div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Income</p>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold`} style={{ color: INCOME_COLOR }}>
                {loading ? '---' : stats.totalIncome.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-slate-500">฿</span>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-red-400/50 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
               <p className="text-lg font-semibold text-slate-700">รายจ่ายรวม</p>
               <div className="p-2 rounded-full bg-red-100 text-red-600">
                   {getIconForType('expense')}
               </div>
            </div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Expense</p>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold`} style={{ color: EXPENSE_COLOR }}>
                {loading ? '---' : stats.totalExpenses.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-slate-500">฿</span>
            </div>
          </div>

          {/* Net Balance Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-yellow-400/50 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
               <p className="text-lg font-semibold text-slate-700">ยอดคงเหลือสุทธิ</p>
               <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                   {/* Net Savings Icon */}
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586L4 17m0 0V5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6m-2 0l-2 2"/></svg>
               </div>
            </div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Net Savings</p>
            <div className="flex items-end gap-2">
              <span 
                className={`text-4xl font-bold ${getNetSavingColorClass(stats.netSavings)}`} 
                style={{ color: stats.netSavings >= 0 ? INCOME_COLOR : EXPENSE_COLOR }}
               >
                {loading ? '---' : Math.abs(stats.netSavings).toLocaleString()}
              </span>
              <span className="text-xl font-bold text-slate-500">฿</span>
            </div>
          </div>

        </div>

        {/* Recent Transactions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 pl-3 border-[#4db8a8]">ธุรกรรมล่าสุด (5 รายการ)</h2>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
            
            {loading ? (
              <p className="text-slate-500 text-center py-8">กำลังโหลด...</p>
            ) : stats.recentTransactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">ไม่มีธุรกรรมในเดือนนี้</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentTransactions.map((txn) => (
                  <div 
                    key={txn._id} 
                    className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors px-2 rounded-lg"
                  >
                    {/* Left: Icon + Details */}
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: txn.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR, color: 'white' }}>
                        
                        {txn.type === 'income' ? 
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg> :
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        }
                      </div>
                      
                      {/* Transaction Info */}
                      <div>
                        <p className="font-semibold text-slate-800 text-base">
                          {txn.category?.name || 'หมวดหมู่ไม่ระบุ'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(txn.date).toLocaleDateString('th-TH', { 
                            day: 'numeric',
                            month: 'short',
                          })}
                          {' | '}
                          {txn.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className={`text-lg font-bold flex-shrink-0 ml-4`}
                         style={{ color: txn.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
                      {txn.type === 'expense' ? '-' : '+'}{txn.amount.toLocaleString()} ฿
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* View All Link */}
             <div className="pt-2 text-center">
                <Link href="/transactions" style={{ color: PRIMARY_COLOR_DARK }} className="text-sm font-semibold hover:underline">
                    ดูธุรกรรมทั้งหมด &rarr;
                </Link>
             </div>
          </div>
        </div>

      </div>
      
      {/* Floating Action Button (FAB) */}
      <Link
        href="/transactions/add"
        className="fixed right-8 bottom-8 w-16 h-16 rounded-full shadow-2xl text-white flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        style={{ backgroundColor: PRIMARY_COLOR_DARK, boxShadow: `0 10px 20px rgba(41, 157, 145, 0.5)` }}
        aria-label="เพิ่มรายการ"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </Link>
    </main>
  );
}