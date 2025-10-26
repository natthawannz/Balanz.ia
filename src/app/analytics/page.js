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
      const transactionDate = new Date(t.date);
      const tMonthYear = `${monthNames[transactionDate.getMonth()]} ${transactionDate.getFullYear() + 543}`;
      return tMonthYear === selectedMonth;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // เรียงล่าสุดมาก่อน

  const incomeByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = filteredTransactions
      .filter((t) => t.type === 'income' && t.category?.name === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);
    return acc;
  }, {});
  const expenseByCategory = categories
    .filter((cat) => cat.type === 'expense') // กรองเฉพาะหมวดหมู่ประเภท expense
    .reduce((acc, cat) => {
      acc[cat.name] = filteredTransactions
        .filter((t) => t.type === 'expense' && t.category?.name === cat.name)
        .reduce((sum, t) => sum + t.amount, 0);
      return acc;
    }, {});

  const summary = filteredTransactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount;
      else acc.totalExpense += t.amount;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );
  summary.balance = summary.totalIncome - summary.totalExpense;

  // Pie Chart Data
  const pieData = {
    labels: categories
      .filter((cat) => cat.type === 'expense' && expenseByCategory[cat.name] > 0)
      .map((cat) => cat.name),
    datasets: [
      {
        data: categories
          .filter((cat) => cat.type === 'expense' && expenseByCategory[cat.name] > 0)
          .map((cat) => expenseByCategory[cat.name]),
        backgroundColor: ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#059669'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Bar Chart Data (ปรับให้แสดงเฉพาะเดือนที่เลือก)
  const barData = {
    labels: [selectedMonth],
    datasets: [
      {
        label: 'รายรับ',
        data: [filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)],
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'รายจ่าย',
        data: [filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)],
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
        borderWidth: 1,
      },
    ],
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
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933c-.784.57-.943 1.6-.3 2.4z" />
          </svg>
          รายงานการเงิน
        </h1>
      </div>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-600">กำลังโหลด...</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-7 flex justify-between items-center">
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 0))}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-800">{selectedMonth}</h2>

            <button
              onClick={() =>
                setCurrentMonthIndex((prev) =>
                  prev < months.length - 1 ? prev + 1 : months.length - 1
                )
              }
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600">รายรับรวม</h3>
              <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toLocaleString()} บาท</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600">รายจ่ายรวม</h3>
              <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toLocaleString()} บาท</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600">ยอดคงเหลือ</h3>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.balance.toLocaleString()} บาท
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายรับตามหมวดหมู่</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                incomeByCategory[cat.name] > 0 && (
                  <div key={cat._id} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <h4 className="text-sm font-medium text-gray-700">{cat.name}</h4>
                    <p className="text-lg font-bold text-green-600">{incomeByCategory[cat.name].toLocaleString()} บาท</p>
                  </div>
                )
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายจ่ายตามหมวดหมู่</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories
                .filter((cat) => cat.type === 'expense') // กรองเฉพาะหมวดหมู่ประเภท expense
                .map((cat) => (
                  expenseByCategory[cat.name] > 0 && (
                    <div key={cat._id} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <h4 className="text-sm font-medium text-gray-700">{cat.name}</h4>
                      <p className="text-lg font-bold text-red-600">{expenseByCategory[cat.name].toLocaleString()} บาท</p>
                    </div>
                  )
                ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">การกระจายรายจ่ายตามหมวดหมู่</h3>
            <div className="max-w-md mx-auto">
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายรับ-รายจ่ายรายเดือน</h3>
            <div className="max-w-4xl mx-auto">
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
          </div>

          {/* ตารางประวัติธุรกรรมกับการแบ่งหน้า */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ประวัติธุรกรรม</h3>
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-gray-600">ไม่มีธุรกรรมในช่วงเวลานี้</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-4 text-left text-gray-600">จำนวนเงิน (บาท)</th>
                        <th className="py-2 px-4 text-left text-gray-600">ประเภท</th>
                        <th className="py-2 px-4 text-left text-gray-600">หมวดหมู่</th>
                        <th className="py-2 px-4 text-left text-gray-600">วันที่</th>
                        <th className="py-2 px-4 text-left text-gray-600">หมายเหตุ</th>
                        <th className="py-2 px-4 text-left text-gray-600">สร้างเมื่อ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((t) => {
                        const category = categories.find((cat) => cat._id.toString() === t.category?.toString());
                        return (
                          <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50 text-gray-700">
                            <td className="py-2 px-4">{t.amount.toLocaleString()}</td>
                            <td className="py-2 px-4">{t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</td>
                            <td className="py-2 px-4">{t.category?.name || 'ไม่มี'}</td>
                            <td className="py-2 px-4">{new Date(t.date).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td className="py-2 px-4">{t.notes || 'ไม่มี'}</td>
                            <td className="py-2 px-4">{new Date(t.createdAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className="mt-4 flex justify-center items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:text-gray-300"
                  >
                    ย้อนกลับ
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 rounded ${currentPage === page ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:text-gray-300"
                  >
                    ถัดไป
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="mt-8">
        <Link href="/dashboard" className="bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition-colors">
          กลับไปที่ Dashboard
        </Link>
      </div>
    </main>
  );
}