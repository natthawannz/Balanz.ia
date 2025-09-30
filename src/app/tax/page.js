"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [deductions, setDeductions] = useState('');
  const [withholdingTax, setWithholdingTax] = useState('');
  const [taxResult, setTaxResult] = useState(null);
  const [vatPrice, setVatPrice] = useState(''); 
  const [vatAmount, setVatAmount] = useState(0);
  const [error, setError] = useState('');

  // อัตราภาษีขั้นบันได (ตามประมวลรัษฎากร 2568)
  const taxRates = [
    { min: 0, max: 150000, rate: 0 },
    { min: 150001, max: 300000, rate: 0.05 },
    { min: 300001, max: 500000, rate: 0.10 },
    { min: 500001, max: 750000, rate: 0.15 },
    { min: 750001, max: 1000000, rate: 0.20 },
    { min: 1000001, max: 2000000, rate: 0.25 },
    { min: 2000001, max: 5000000, rate: 0.30 },
    { min: 5000001, max: Infinity, rate: 0.35 },
  ];

  const calculateTax = () => {
    setError('');
    setTaxResult(null);

    const incomeValue = parseFloat(income);
    const expensesValue = parseFloat(expenses);
    const deductionsValue = parseFloat(deductions);
    const withholdingTaxValue = parseFloat(withholdingTax);

    if (isNaN(incomeValue) || incomeValue < 0) {
      setError('กรุณากรอกรายได้ที่ถูกต้องและมากกว่าหรือเท่ากับ 0');
      return;
    }
    if (!isNaN(expensesValue) && expensesValue < 0) {
      setError('ค่าใช้จ่ายต้องมากกว่าหรือเท่ากับ 0');
      return;
    }
    if (!isNaN(deductionsValue) && deductionsValue < 0) {
      setError('ค่าลดหย่อนต้องมากกว่าหรือเท่ากับ 0');
      return;
    }
    if (!isNaN(withholdingTaxValue) && withholdingTaxValue < 0) {
      setError('ภาษีหัก ณ ที่จ่ายต้องมากกว่าหรือเท่ากับ 0');
      return;
    }

    // คำนวณรายได้สุทธิ
    const taxableIncome = incomeValue - (expensesValue || 0) - (deductionsValue || 0);

    // คำนวณภาษีตามอัตราขั้นบันได
    let tax = 0;
    let remainingIncome = taxableIncome;
    for (const rate of taxRates) {
      if (remainingIncome <= 0) break;
      const taxableAmount = Math.min(remainingIncome, rate.max - rate.min);
      if (taxableAmount > 0) {
        tax += taxableAmount * rate.rate;
      }
      remainingIncome -= taxableAmount;
    }

    // ปัดเศษตามกฎหมาย (ปัดลงเป็นหน่วย 10)
    tax = Math.floor(tax / 10) * 10;

    // หักภาษี ณ ที่จ่าย
    const netTax = tax - (withholdingTaxValue || 0);
    const finalTax = netTax > 0 ? netTax : 0;

    setTaxResult({
      taxableIncome,
      tax,
      withholdingTax: withholdingTaxValue || 0,
      finalTax,
    });
  };

  // คำนวณ VAT 7% (ทำงานทันทีเมื่อกรอกราคา)
  const handleVatPriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    if (price < 0) {
      setError('ราคาสินค้าต้องมากกว่าหรือเท่ากับ 0');
      setVatAmount(0);
      setVatPrice('');
      return;
    }
    const vatRate = 0.07; // อัตราภาษีมูลค่าเพิ่ม 7%
    setVatPrice(e.target.value);
    setVatAmount(price * vatRate);
    setError(''); // ล้างข้อความเตือน
  };

  // ฟังก์ชันจัดรูปแบบตัวเลขด้วยคอมมา
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <main className="container mx-auto px-6 py-8" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          คำนวณภาษี
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
            <label className="block text-sm font-medium text-gray-700">รายได้ทั้งหมด (บาท)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder=""
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ค่าใช้จ่าย (บาท)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ค่าลดหย่อน (บาท)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ภาษีหัก ณ ที่จ่าย (บาท)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={withholdingTax}
              onChange={(e) => setWithholdingTax(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder=""
            />
          </div>
          <div>
            <button
              type="button"
              onClick={calculateTax}
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              คำนวณภาษี
            </button>
          </div>
          {taxResult && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">ผลการคำนวณ</h2>
              <p><strong>รายได้สุทธิ (ก่อนหักภาษี):</strong> {formatNumber(taxResult.taxableIncome.toFixed(2))} บาท</p>
              <p><strong>ภาษีที่ต้องจ่าย (ก่อนหัก):</strong> {formatNumber(taxResult.tax.toFixed(2))} บาท</p>
              <p><strong>ภาษีหัก ณ ที่จ่าย:</strong> {formatNumber(taxResult.withholdingTax.toFixed(2))} บาท</p>
              <p><strong>ภาษีสุทธิที่ต้องจ่าย:</strong> {formatNumber(taxResult.finalTax.toFixed(2))} บาท</p>
              <p className="mt-2 text-sm text-gray-600">
                *หมายเหตุ: ภาษีมูลค่าเพิ่ม (VAT 7%) เป็นภาษีที่รวมอยู่ในราคาสินค้า/บริการแล้ว คุณไม่ต้องยื่นเอง
              </p>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">คำนวณ VAT 7% (ตัวอย่างราคาสินค้า)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={vatPrice}
              onChange={handleVatPriceChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="กรอกราคาสินค้า (บาท)"
            />
            {vatAmount > 0 && !error && (
              <p className="mt-2 text-sm text-gray-600">
                ภาษีมูลค่าเพิ่ม (VAT): {formatNumber(vatAmount.toFixed(2))} บาท
              </p>
            )}
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
    </main>
  );
}