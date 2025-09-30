"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches));

    if (token) {
      fetchNotificationCount(token);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // ตรวจสอบว่าลิงก์ปัจจุบัน active หรือไม่
  const isActive = (path) => pathname === path;

  const fetchNotificationCount = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/check-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setNotificationCount(data.alertCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const resetAndFetchNotifications = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setNotificationCount(0); // รีเซ็ตทันทีหลังจาก backend รีเซ็ต
      }
    } catch (error) {
      console.error('Error resetting notifications:', error);
    }
  };

  return (
    <html lang="th" className={isDarkMode ? 'dark' : ''}>
      <head>
        <title>SAVEi</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className="min-h-screen flex flex-col"
        style={{ fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}
      >
        <header className="border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <img src="/logo.png" alt="SAVEi Logo" className="h-16 w-auto cursor-pointer" />
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="md:hidden">
                  <button
                    onClick={toggleMenu}
                    className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 focus:outline-none p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                    </svg>
                  </button>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="text-green-700 dark:text-green-300 hover:text-green-500 dark:hover:text-green-400 focus:outline-none p-2"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                    </svg>
                  )}
                </button>
                <div className="hidden md:block">
                  <nav className="flex items-center space-x-6">
                    <Link
                      href="/"
                      className={`flex items-center space-x-2 ${
                        isActive('/')
                          ? 'font-bold !text-green-600 dark:!text-green-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                      } transition-colors text-sm sm:text-base`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                      <span>หน้าหลัก</span>
                    </Link>
                    {isLoggedIn && (
                      <>
                        <Link
                          href="/transactions/add"
                          className={`flex items-center space-x-2 ${
                            isActive('/transactions/add')
                              ? 'font-bold !text-green-600 dark:!text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                          } transition-colors text-sm sm:text-base`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                          </svg>
                          <span>เพิ่มรายการธุรกรรม</span>
                        </Link>
                        <Link
                          href="/budget"
                          className={`flex items-center space-x-2 ${
                            isActive('/budget')
                              ? 'font-bold !text-green-600 dark:!text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                          } transition-colors text-sm sm:text-base`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3h8v4m-9 4h10M5 11v10h14V11"
                            />
                          </svg>
                          <span>งบประมาณ</span>
                        </Link>
                        <Link
                          href="/currency"
                          className={`flex items-center space-x-2 ${
                            isActive('/currency')
                              ? 'font-bold !text-green-600 dark:!text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                          } transition-colors text-sm sm:text-base`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0120 12.75M20 20v-5h-.581m0 0A7.5 7.5 0 014 11.25" />
                          </svg>
                          <span>อัตราแลกเปลี่ยน</span>
                        </Link>
                        <Link
                          href="/tax"
                          className={`flex items-center space-x-2 ${
                            isActive('/tax')
                              ? 'font-bold !text-green-600 dark:!text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                          } transition-colors text-sm sm:text-base`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" />
                          </svg>
                          <span>คำนวณภาษี</span>
                        </Link>
                        <Link
                          href="/analytics"
                          className={`flex items-center space-x-2 ${
                            isActive('/analytics')
                              ? 'font-bold !text-green-600 dark:!text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                          } transition-colors text-sm sm:text-base`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                          </svg>
                          <span>สรุป</span>
                        </Link>
                <Link
  href="/notifications"
  onClick={() => resetAndFetchNotifications(localStorage.getItem('token'))}
  className="flex items-center space-x-2"
>
  {/* Icon + Badge */}
  <div className="relative">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
    </svg>
    {notificationCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
        {notificationCount}
      </span>
    )}
  </div>

  {/* Label */}
  <span>การแจ้งเตือน</span>
</Link>

                        <Link
                          href="/profile"
                          className={`flex items-center space-x-2 ${
                            isActive('/profile')
                              ? 'font-bold !text-green-600 dark:!text-green-400'
                              : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                          } transition-colors text-sm sm:text-base`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"/>
                          </svg>
                          <span>โปรไฟล์</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors text-sm sm:text-base"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
                          </svg>
                          <span>ออกจากระบบ</span>
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <nav
className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} fixed top-0 left-0 w-full h-full bg-white dark:bg-[#bdf2f4] bg-opacity-95 p-6 overflow-y-auto z-50`}

        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-800">เมนู</h2>
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 focus:outline-none p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          {isLoggedIn && (
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-white-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-white-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <span className="text-lg">หน้าหลัก</span>
              </Link>
              <Link
                href="/transactions/add"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/transactions/add')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
                <span className="text-lg">เพิ่มรายการธุรกรรม</span>
              </Link>
              <Link
                href="/budget"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/budget')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3h8v4m-9 4h10M5 11v10h14V11"/>
                </svg>
                <span className="text-lg">งบประมาณ</span>
              </Link>

                  <Link
                href="/currency"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/currency')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m0 0A7.5 7.5 0 0120 12.75M20 20v-5h-.581m0 0A7.5 7.5 0 014 11.25"/>
                </svg>
                <span className="text-lg">อัตราแลกเปลี่ยน</span>
              </Link>


                  <Link
                href="/tax"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/tax')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                </svg>
                <span className="text-lg">คำนวณภาษี</span>
              </Link>



                  <Link
                href="/analytics"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/analytics')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                <span className="text-lg">สรุป</span>
              </Link>
              
     <Link
  href="/notifications"
  onClick={() => { resetAndFetchNotifications(localStorage.getItem('token')); toggleMenu(); }}
  className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
    isActive('/notifications')
      ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
      : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
  }`}
>
  {/* Icon + Badge ซ้อนกัน */}
  <div className="relative">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
    </svg>
    {notificationCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
        {notificationCount}
      </span>
    )}
  </div>

  {/* Label */}
  <span className="text-lg">การแจ้งเตือน</span>
</Link>





                   <Link
                href="/profile"
                onClick={toggleMenu}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
                  isActive('/profile')
                    ? 'font-bold !text-green-600 dark:!text-green-400 bg-gray-100 dark:bg-white-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"/>
                </svg>
                <span className="text-lg">โปรไฟล์</span>
              </Link>

              <button
                onClick={() => { handleLogout(); toggleMenu(); }}
                className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white-800 w-full text-left"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
                </svg>
                <span className="text-lg">ออกจากระบบ</span>
              </button>
            </div>
          )}
        </nav>

        <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600 dark:text-gray-400">
                <Link href="/help" className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-green-400 transition-colors text-sm sm:text-base">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                  <span>ช่วยเหลือ</span>
                </Link>
                <Link href="/contact" className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-green-400 transition-colors text-sm sm:text-base">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span>ติดต่อเรา</span>
                </Link>
              </div>
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                © 2025 SAVEi. สงวนลิขสิทธิ์
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}