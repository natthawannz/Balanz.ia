"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// กำหนด monthNames ไว้ด้านบน
const monthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(60); // เริ่มที่เดือนปัจจุบัน (60 เดือนย้อนหลัง)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // จำนวนรายการต่อหน้า

  // คำนวณเดือนย้อนหลัง 5 ปี (60 เดือน) และอนาคต 12 เดือน
  const getMonths = () => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() + 543; // แปลงเป็น พ.ศ.
    const currentMonth = currentDate.getMonth();
    const totalMonths = 72; // 60 เดือนย้อนหลัง + 12 เดือนข้างหน้า
    for (let i = -60; i < 60; i++) {
      const monthIndex = (currentMonth + i + 12) % 12;
      const yearOffset = Math.floor((currentMonth + i) / 12);
      const year = currentYear + yearOffset;
      months.push(`${monthNames[monthIndex]} ${year}`);
    }
    return months;
  };

  const months = getMonths();
  const selectedMonth = months[currentMonthIndex];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setIsLoggedIn(true);
      Promise.all([fetchTransactions(token), fetchCategories(token)]).catch((err) => {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
        setLoading(false);
      });
    }
  }, [currentMonthIndex]);

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงธุรกรรม');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const fetchCategories = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงหมวดหมู่');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      const tMonthYear = `${monthNames[tDate.getMonth()]} ${tDate.getFullYear() + 543}`;
      return tMonthYear === selectedMonth;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const summary = {
    totalIncome: filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    balance: 0,
  };
  summary.balance = summary.totalIncome - summary.totalExpense;

  const pieData = {
    labels: categories
      .filter((cat) => cat.type === 'expense')
      .map((cat) => cat.name),
    datasets: [
      {
        data: categories
          .filter((cat) => cat.type === 'expense')
          .map((cat) => {
            const categoryTransactions = filteredTransactions.filter(
              (t) => t.category && t.category._id === cat._id && t.type === 'expense'
            );
            return categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
          }),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const barData = {
    labels: [selectedMonth],
    datasets: [
      {
        label: 'รายรับ',
        data: [filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)],
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'รายจ่าย',
        data: [filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)],
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 flex-1 w-full">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#299D91]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-200"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#299D91] to-[#238A80] shadow-xl shadow-[#299D91]/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 mb-2">สรุปและวิเคราะห์</h1>
              <p className="text-gray-600 text-lg">ข้อมูลทางการเงินของคุณในรูปแบบที่เข้าใจง่าย</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-3 shadow-lg backdrop-blur-xl mb-6">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#299D91] to-[#238A80] shadow-xl shadow-[#299D91]/30 mb-4">
                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Month Navigation */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">เลือกเดือน</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 0))}
                    className="p-3 bg-gray-100 hover:bg-[#299D91] hover:text-white rounded-xl transition-all duration-300 text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="text-lg font-semibold text-[#299D91] px-4 py-2 bg-[#299D91]/10 rounded-xl">
                    {selectedMonth}
                  </span>
                  <button
                    onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : months.length - 1))}
                    className="p-3 bg-gray-100 hover:bg-[#299D91] hover:text-white rounded-xl transition-all duration-300 text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">รายรับ</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} ฿
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">รายจ่าย</span>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} ฿
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">ยอดคงเหลือ</span>
                </div>
                <p className={`text-3xl font-bold ${
                  (filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                   filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                    filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()} ฿
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">สัดส่วนรายจ่ายตามหมวดหมู่</h3>
                <div className="h-80 flex items-center justify-center">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">เปรียบเทียบรายรับ-รายจ่าย</h3>
                <div className="h-80 flex items-center justify-center">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">รายการธุรกรรมล่าสุด</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">วันที่</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">หมวดหมู่</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">รายการ</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(transaction.date).toLocaleDateString('th-TH')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{transaction.category?.icon || '📁'}</span>
                            <span className="text-gray-700">{transaction.category?.name || 'ไม่ระบุ'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                            </span>
                            <span className="text-gray-700">{transaction.notes || '-'}</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ฿
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredTransactions.length)} จาก {filteredTransactions.length} รายการ
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ก่อนหน้า
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-[#299D91] text-white'
                              : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}