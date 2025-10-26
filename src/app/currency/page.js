"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(1);
  const [currencyFrom, setCurrencyFrom] = useState('THB');
  const [currencyTo, setCurrencyTo] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const currencies = ['THB', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'SGD', 'MYR'];


  const fetchExchangeRate = async () => {
    setLoading(true);
    setError('');
    setConvertedAmount(0); // รีเซ็ตเป็น 0
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/8bbc615d301e39e513367d84/latest/${currencyFrom}`);
      const data = await response.json();
      if (data.result === 'success') {
        setExchangeRate(data.conversion_rates[currencyTo]);
      } else {
        setError('ไม่สามารถดึงอัตราแลกเปลี่ยนได้');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // คำนวณการแปลงเงิน
  const convertCurrency = () => {
    if (exchangeRate && !isNaN(amount) && amount >= 0) {
      setConvertedAmount(amount * exchangeRate);
    } else {
      setConvertedAmount(0);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [currencyFrom, currencyTo]);

  // ฟังก์ชันรีเฟรชที่รีเซ็ตทุกอย่าง
  const handleRefresh = () => {
    setAmount(1);
    setCurrencyFrom('THB');
    setCurrencyTo('USD');
    setConvertedAmount(0);
    setExchangeRate(null);
    setError('');
    fetchExchangeRate();
  };

  useEffect(() => {
    convertCurrency();
  }, [amount, exchangeRate]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 flex-1 w-full" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#299D91]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0120 12.75M20 20v-5h-.581m0 0A7.5 7.5 0 014 11.25" />
            </svg>
            อัตราแลกเปลี่ยนเงิน
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเงิน</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-gray-700"
                placeholder="เช่น 100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สกุลเงินต้นทาง</label>
              <select
                value={currencyFrom}
                onChange={(e) => setCurrencyFrom(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-gray-700"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สกุลเงินปลายทาง</label>
              <select
                value={currencyTo}
                onChange={(e) => setCurrencyTo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-gray-700"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเงินที่แปลงแล้ว</label>
              <input
                type="text"
                value={loading ? 'กำลังโหลด...' : convertedAmount.toFixed(2)}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex-1 p-3 bg-[#299D91] text-white rounded-lg hover:bg-[#238A80] transition-colors disabled:bg-gray-400"
              >
                รีเฟรช
              </button>
              <Link
                href="/"
                className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center transition-colors"
              >
                กลับ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}