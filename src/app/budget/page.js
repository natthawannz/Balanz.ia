"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Budget() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(40);
  const [error, setError] = useState('');
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);


  const getMonths = () => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() + 543;
    const currentMonth = currentDate.getMonth();
    const totalMonths = 52;
    for (let i = -40; i < 12; i++) {
      const monthIndex = (currentMonth + i + 12) % 12; // ป้องกันลบเกิน
      const yearOffset = Math.floor((currentMonth + i) / 12);
      const year = currentYear + yearOffset;
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
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
      fetchCategories(token);
      fetchBudgets(token);
      fetchTransactions(token);
    }
  }, [currentMonthIndex]);

  const fetchCategories = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const expenseCategories = data.filter(cat => cat.type === 'expense');
        setCategories(expenseCategories);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงหมวดหมู่');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    }
  };

  const fetchBudgets = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const budgetMap = {};
        data.forEach(b => {
          if (!budgetMap[b.month]) budgetMap[b.month] = [];
          budgetMap[b.month].push({ ...b.category, total: b.total });
        });
        setBudgets(budgetMap);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงงบประมาณ');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    }
  };

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.filter(t => t.type === 'expense'));
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงธุรกรรม');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    }
  };

  const handleTotalChange = (categoryIndex, value, month) => {
    const newBudgets = { ...budgets };
    const category = categories.find((_, i) => i === categoryIndex);
    if (!newBudgets[month]) newBudgets[month] = [];
    const existingIndex = newBudgets[month].findIndex(c => c._id === category._id);
    if (existingIndex > -1) {
      newBudgets[month][existingIndex].total = parseFloat(value) || 0;
    } else {
      newBudgets[month].push({ ...category, total: parseFloat(value) || 0 });
    }
    setBudgets(newBudgets);
    saveBudget(category._id, month, parseFloat(value) || 0);
  };

  const saveBudget = async (categoryId, month, total) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category: categoryId, month, total }),
      });
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการบันทึกงบประมาณ: ' + error.message);
    }
  };

  const handleDeleteBudget = async (categoryId, month) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('คุณแน่ใจหรือว่าต้องการลบงบประมาณนี้?')) {
      return; // หยุดการดำเนินการถ้าผู้ใช้ยกเลิก
    }
    try {
      const res = await fetch(`http://localhost:5000/api/budgets/${categoryId}/${month}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchBudgets(token); // อัปเดตข้อมูลหลังลบ
      } else {
        const data = await res.json();
        setError(data.message || 'เกิดข้อผิดพลาดในการลบงบประมาณ');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    const form = e.target;
    const categoryId = form.category.value;
    const month = form.month.value;
    const total = parseFloat(form.total.value) || 0;

    if (total < 0) {
      setError('ยอดรวมต้องมากกว่าหรือเท่ากับ 0');
      return;
    }

    await saveBudget(categoryId, month, total);
    setShowAddBudgetModal(false);
    fetchBudgets(localStorage.getItem('token')); // อัปเดตข้อมูลหลังเพิ่มงบประมาณ
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // คำนวณรายจ่ายและคงเหลือ
  const calculateTotals = (month) => {
    const budgetData = budgets[month] || categories.map(cat => ({ ...cat, total: 0 }));
    const totalBudget = budgetData.reduce((sum, cat) => sum + (cat.total || 0), 0);
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      const tMonthYear = `${monthNames[tDate.getMonth()]} ${tDate.getFullYear() + 543}`;
      return tMonthYear === month && budgetData.some(cat => cat._id.toString() === t.category._id.toString());
    });
    const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = totalBudget - totalSpent;

    return { totalBudget, totalSpent, remaining };
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <main className="container mx-auto px-6 py-8" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          ระบบจัดการงบประมาณ
        </h1>
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
            </svg>
            {error}
          </div>
        )}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 0))} // ย้อนหลังได้ถึงเดือนแรก
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{selectedMonth}</h2>
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : months.length - 1))} // ไปข้างหน้าได้ถึงเดือนสุดท้าย
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          </div>
          {budgets[selectedMonth] && (
            <div>
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-gray-700">
                <h3 className="text-md font-semibold text-gray-800 mb-2">ภาพรวมงบประมาณ</h3>
                <p><strong>งบประมาณทั้งหมด:</strong> {formatNumber(calculateTotals(selectedMonth).totalBudget.toFixed(0))} บาท</p>
                <p><strong>รายจายรวมทั้งหมด:</strong> {formatNumber(calculateTotals(selectedMonth).totalSpent.toFixed(0))} บาท</p>
                <p><strong>คงเหลือ:</strong> {formatNumber(calculateTotals(selectedMonth).remaining.toFixed(0))} บาท</p>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6">{selectedMonth}</h2>
              {budgets[selectedMonth]?.map((category, index) => {
                const catTransactions = transactions.filter(t => {
                  const tDate = new Date(t.date);
                  const tMonthYear = `${monthNames[tDate.getMonth()]} ${tDate.getFullYear() + 543}`;
                  return tMonthYear === selectedMonth && t.category._id.toString() === category._id.toString();
                });
                const spent = catTransactions.reduce((sum, t) => sum + t.amount, 0);
                const remaining = (category.total || 0) - spent;

                return (
                  <div key={category._id} className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                    {/* แถวบน: Icon + ชื่อหมวด */}
                    <div className="flex items-center mb-2 sm:mb-0">
                      <span className="text-2xl mr-2">{category.icon}</span>
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </div>

                    {/* แถวล่าง: Input + ใช้ไป + คงเหลือ */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 flex-1">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={category.total || ''}
                        onChange={(e) => handleTotalChange(index, e.target.value, selectedMonth)}
                        className="w-full sm:w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 mb-2 sm:mb-0"
                        placeholder="ยอดรวม"
                      />
                      <span className="text-gray-800 text-sm">ใช้ไป: {formatNumber(spent.toFixed(0))} บาท</span>
                      <span className="text-gray-800 text-sm">คงเหลือ: {formatNumber(remaining.toFixed(0))} บาท</span>
                    </div>

                    {/* ปุ่ม Delete */}
                    <button
                      onClick={() => handleDeleteBudget(category._id, selectedMonth)}
                      className="mt-2 sm:mt-0 ml-auto p-2 bg-gray-200 text-white rounded-full hover:bg-red-700 transition-colors flex items-center justify-center"
                      title="ลบงบประมาณ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}

            </div>
          )}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAddBudgetModal(true)}
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              เพิ่มงบประมาณ
            </button>
          </div>
          <div className="flex space-x-4 mt-6">
            <Link
              href="/"
              className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center transition-colors"
            >
              กลับ
            </Link>
          </div>
        </div>
      </div>

      {showAddBudgetModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowAddBudgetModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">เพิ่มงบประมาณ</h3>
            <form onSubmit={handleAddBudget} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">หมวดหมู่</label>
                <select
                  name="category"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-700"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.icon}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">เดือน</label>
                <select
                  name="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setCurrentMonthIndex(months.indexOf(e.target.value));
                  }}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-700"
                >
                  {months.slice(currentMonthIndex).map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">ยอดรวม (บาท)</label>
                <input
                  type="number"
                  name="total"
                  step="1"
                  min="0"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-700"
                  placeholder="เช่น 5000"
                  required
                />
              </div>
              <div className="flex space-x-6 mt-8">
                <button
                  type="submit"
                  className="flex-1 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBudgetModal(false)}
                  className="flex-1 p-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-lg font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}