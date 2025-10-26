"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Currency() {
  const [amount, setAmount] = useState(0);
  const [currencyFrom, setCurrencyFrom] = useState('THB');
  const [currencyTo, setCurrencyTo] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencies = ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'SGD', 'AUD'];

  useEffect(() => {
    fetchExchangeRate();
  }, [currencyFrom, currencyTo]);

  useEffect(() => {
    if (exchangeRate) {
      setConvertedAmount(amount * exchangeRate);
    }
  }, [amount, exchangeRate]);

  const fetchExchangeRate = async () => {
    if (currencyFrom === currencyTo) {
      setExchangeRate(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/${currencyFrom}`
      );
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลอัตราแลกเปลี่ยนได้');
      }

      const data = await response.json();
      
      if (data.result === 'success') {
        const rate = data.rates[currencyTo];
        setExchangeRate(rate);
      } else {
        throw new Error('ข้อมูลอัตราแลกเปลี่ยนไม่ถูกต้อง');
      }
    } catch (error) {
      setError(error.message);
      setExchangeRate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setAmount(0);
    setCurrencyFrom('THB');
    setCurrencyTo('USD');
    setExchangeRate(null);
    setConvertedAmount(0);
    setError('');
    fetchExchangeRate();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 flex-1 w-full" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#299D91]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-200"></div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#299D91] to-[#238A80] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0120 12.75M20 20v-5h-.581m0 0A7.5 7.5 0 014 11.25" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold">อัตราแลกเปลี่ยนเงิน</h1>
                  <p className="text-sm text-white/80">แปลงสกุลเงินแบบเรียลไทม์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0120 12.75M20 20v-5h-.581m0 0A7.5 7.5 0 014 11.25" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg flex items-start space-x-2 shadow-lg backdrop-blur-xl">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <p className="text-xs font-medium text-red-300">{error}</p>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <div className="p-1 bg-green-100 rounded">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span>จำนวนเงิน</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] focus:border-transparent text-gray-700 text-base font-medium transition-all duration-200"
                  placeholder="เช่น 100"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-gray-400 font-medium text-sm">{currencyFrom}</span>
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                  <div className="p-1 bg-blue-100 rounded">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <span>จาก</span>
                </label>
                <select
                  value={currencyFrom}
                  onChange={(e) => setCurrencyFrom(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] focus:border-transparent text-gray-700 text-base font-medium transition-all duration-200"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                  <div className="p-1 bg-purple-100 rounded">
                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <span>เป็น</span>
                </label>
                <select
                  value={currencyTo}
                  onChange={(e) => setCurrencyTo(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] focus:border-transparent text-gray-700 text-base font-medium transition-all duration-200"
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exchange Rate Display */}
            {exchangeRate && (
              <div className="bg-gradient-to-r from-[#299D91]/10 to-[#238A80]/10 rounded-lg p-3 border border-[#299D91]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">อัตราแลกเปลี่ยน</span>
                  <span className="text-sm font-bold text-[#299D91]">
                    1 {currencyFrom} = {exchangeRate.toFixed(4)} {currencyTo}
                  </span>
                </div>
              </div>
            )}

            {/* Result */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <div className="p-1 bg-orange-100 rounded">
                  <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>ผลลัพธ์</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loading ? 'กำลังโหลด...' : convertedAmount.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-base font-bold"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-gray-400 font-medium text-sm">{currencyTo}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#299D91] to-[#238A80] text-white rounded-lg hover:from-[#238A80] hover:to-[#1f7a72] transition-all duration-200 disabled:bg-gray-400 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0120 12.75M20 20v-5h-.581m0 0A7.5 7.5 0 014 11.25" />
                  </svg>
                  <span>{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
                </div>
              </button>
              <Link
                href="/dashboard"
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center transition-all duration-200 font-semibold text-sm border-2 border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>กลับ</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
