"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      fetchNotifications(token);
    }
  }, []);

  const fetchNotifications = async (token) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Notifications data:', data.notifications); // Debug ข้อมูล
      if (res.ok) {
        setNotifications(data.notifications || []);
        localStorage.setItem('notificationCount', '0');
      } else {
        setError('ไม่สามารถดึงข้อมูลแจ้งเตือนได้: ' + (data.message || res.statusText));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแยกข้อมูลจาก alertMessage
  const parseNotification = (alertMessage) => {
    const match = alertMessage.match(/(.+): หมวด (.+) เหลือ (\d+\.?\d*) บาท/);
    if (match) {
      const [, month, categoryName, amountLeft] = match;
      return { amountLeft: parseFloat(amountLeft) };
    }
    return { amountLeft: 0 }; // ค่าเริ่มต้นถ้าไม่ match
  };

  if (loading) return <div className="text-center py-10">กำลังโหลด...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <main className="container mx-auto px-6 py-8" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
          การแจ้งเตือน
        </h1>
        {notifications.length === 0 ? (
          <p className="text-gray-600 text-center py-10">ไม่มีแจ้งเตือนในขณะนี้</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification, index) => {
              const { amountLeft } = parseNotification(notification.alertMessage);
              const amountSpent = parseFloat(notification.amountSpent || 0);
              const budgetTotal = parseFloat(notification.budgetTotal || 0);

              return (
                <li key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col space-y-2">
                    <p className="text-gray-800">
                      <strong>{notification.month}: หมวด {notification.categoryName}</strong>
                    </p>
                    <p className="text-gray-700">
                      - เหลือ: <span className={amountLeft < 50 ? 'text-red-600 font-semibold' : 'text-green-600'}>{amountLeft}</span>
                    </p>
                    <p className="text-gray-700">
                      - ใช้ไป: {amountSpent.toFixed(2)} บาท
                    </p>
                    <p className="text-gray-700">
                      - งบทั้งหมด: {budgetTotal.toFixed(2)} บาท
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-6">
          <Link
            href="/"
            className="w-full p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center block transition-colors"
          >
            กลับ
          </Link>
        </div>
      </div>
    </main>
  );
}