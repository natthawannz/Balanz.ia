"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isLanding = isHome || pathname === '/register' || pathname === '/login' || pathname === '/change-password' || pathname === '/forgot-password' || pathname === '/reset-password';

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetchNotificationCount(token);
    }
    const storedName = localStorage.getItem('name') || localStorage.getItem('displayName');
    if (storedName) setDisplayName(storedName);
    const localAvatar = localStorage.getItem('avatarUrl');
    if (localAvatar) setAvatarUrl(localAvatar);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('displayName');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error resetting notifications:', error);
    }
  };

  const NavLink = ({ href, icon, children, badge, onClick }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
        isActive(href)
          ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30 scale-[1.02]'
          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:scale-[1.01]'
      }`}
    >
      <div className={`relative p-2.5 rounded-lg transition-all duration-300 ${
        isActive(href) 
          ? 'bg-white/20 shadow-inner' 
          : 'bg-slate-700/50 group-hover:bg-slate-600/50'
      }`}>
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-primary items-center justify-center text-[10px] font-bold text-white border-2 border-slate-800">
              {badge}
            </span>
          </span>
        )}
      </div>
      <span className="font-medium flex-1">{children}</span>
      {isActive(href) && (
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
      )}
    </Link>
  );

  const MobileNavLink = ({ href, icon, children, badge, onClick }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-4 py-4 px-5 rounded-2xl transition-all duration-300 ${
        isActive(href)
          ? 'bg-gradient-to-r from-[#299D91] to-[#1f7a6f] text-white shadow-xl shadow-[#299D91]/30 scale-[1.02]'
          : 'text-[#666666] hover:bg-[#F3F3F3] hover:text-[#299D91] hover:scale-[1.01]'
      }`}
    >
      <div className={`relative p-3 rounded-xl transition-all duration-300 ${
        isActive(href) ? 'bg-white/20' : 'bg-[#F3F3F3]'
      }`}>
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#299D91] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#299D91] items-center justify-center text-[10px] font-bold text-white border-2 border-white">
              {badge}
            </span>
          </span>
        )}
      </div>
      <span className="text-lg font-medium flex-1">{children}</span>
      {isActive(href) && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
        </svg>
      )}
    </Link>
  );

  return (
    <html lang="th">
      <head>
        <title>Balanz.IA - ระบบจัดการการเงินอัจฉริยะ</title>
        <meta name="description" content="จัดการการเงินอย่างฉลาดด้วย AI" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50"
        style={{ fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}
      >
        {/* Mobile Header */}
        <header className="md:hidden border-b sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/30">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="font-extrabold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Balanz<span className="text-primary">.IA</span>
      </span>
                        </Link>
                        <button
                onClick={toggleMenu}
                className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"/>
                  )}
                          </svg>
                        </button>
            </div>
          </div>
        </header>

        <div className="md:flex flex-1">
          {/* Desktop Sidebar */}
          {!isLanding && (
            <aside className="hidden md:flex fixed h-screen w-80 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-r border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Logo Section */}
              <div className="relative px-6 py-8 border-b border-slate-700/50">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl shadow-primary/30">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-2xl text-white group-hover:text-primary-light transition-colors">
                      Balanz<span className="text-slate-300">.IA</span>
                    </span>
                    <span className="text-xs text-slate-400">ระบบจัดการการเงินอัจฉริยะ</span>
                  </div>
              </Link>
            </div>

              {/* Navigation */}
              <nav className="relative flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <NavLink href="/" icon={<img src="/icons/grid.png" alt="" className="w-5 h-5" />}>
                  หน้าหลัก
                </NavLink>
              {isLoggedIn && (
                <>
                    <NavLink href="/transactions/add" icon={<img src="/icons/wallet-add.png" alt="" className="w-5 h-5" />}>
                      เพิ่มรายการธุรกรรม
                    </NavLink>
                    <NavLink href="/budget" icon={<img src="/icons/target-dollar.png" alt="" className="w-5 h-5" />}>
                      งบประมาณ
                    </NavLink>
                    <NavLink href="/currency" icon={<img src="/icons/exchange.png" alt="" className="w-5 h-5" />}>
                      อัตราแลกเปลี่ยน
                    </NavLink>
                    <NavLink href="/analytics" icon={<img src="/icons/bars.png" alt="" className="w-5 h-5" />}>
                      สรุปและวิเคราะห์
                    </NavLink>
                    <NavLink 
                      href="/notifications" 
                      badge={notificationCount}
                      onClick={() => resetAndFetchNotifications(localStorage.getItem('token'))}
                      icon={
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                        </svg>
                      }
                    >
                      การแจ้งเตือน
                    </NavLink>
                </>
              )}
            </nav>

              {/* Footer Section */}
              <div className="relative p-6 border-t border-slate-700/50 space-y-4">
              {isLoggedIn && (
                  <>
                    {/* Profile Card */}
                    <Link href="/profile" className="flex items-center p-4 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 group border border-slate-600/30 hover:border-slate-500/50 backdrop-blur-sm">
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 overflow-hidden flex items-center justify-center text-white font-bold mr-4 group-hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                          <span className="text-xl">{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-slate-800 rounded-full"></div>
                  </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-semibold truncate">{displayName || 'ผู้ใช้'}</p>
                        <p className="text-xs text-slate-400">ตั้งค่าโปรไฟล์</p>
                  </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                      </svg>
                </Link>

                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white transition-all duration-300 group shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30"
                    >
                      <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
                      </svg>
                      <span className="font-semibold">ออกจากระบบ</span>
                    </button>
                  </>
              )}
            </div>
          </aside>
          )}

          {/* Main Content */}
          <div className={`${isLanding ? 'w-full' : 'w-full md:ml-80'}`}>
            {/* Desktop Top Bar */}
        {!isLanding && (
              <div className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">
                          Hello {displayName || 'ผู้ใช้'}
                        </h1>
                        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('th-TH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
              </div>
                    <div className="flex items-center gap-3">
                      <Link 
                        href="/notifications" 
                        onClick={() => resetAndFetchNotifications(localStorage.getItem('token'))}
                        className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 transition-all duration-300 group shadow-md hover:shadow-lg"
                      >
                        <svg className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
                {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex h-6 w-6 bg-gradient-to-br from-primary to-primary/80 text-white text-xs rounded-full border-2 border-white items-center justify-center font-bold shadow-lg">
                              {notificationCount}
                            </span>
                          </span>
                )}
              </Link>
                    </div>
                  </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        <nav
              className={`md:hidden fixed inset-0 bg-white/98 backdrop-blur-xl p-6 overflow-y-auto z-50 transition-all duration-500 ${
                isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#299D91] to-[#1f7a6f] flex items-center justify-center shadow-xl shadow-[#299D91]/30">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-[#191919]">เมนู</h2>
                    <span className="text-xs text-[#9F9F9F]">นำทาง</span>
                  </div>
                </div>
            <button
              onClick={toggleMenu}
                  className="p-3 rounded-xl bg-[#F3F3F3] hover:bg-[#E8E8E8] text-[#666666] hover:text-[#191919] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {isLoggedIn && (
                <div className="flex flex-col space-y-3">
                  <MobileNavLink 
                href="/"
                onClick={toggleMenu}
                    icon={<img src="/icons/grid.png" alt="" className="w-6 h-6" />}
                  >
                    หน้าหลัก
                  </MobileNavLink>
                  <MobileNavLink 
                href="/transactions/add"
                onClick={toggleMenu}
                    icon={<img src="/icons/wallet-add.png" alt="" className="w-6 h-6" />}
                  >
                    เพิ่มรายการธุรกรรม
                  </MobileNavLink>
                  <MobileNavLink 
                href="/budget"
                onClick={toggleMenu}
                    icon={<img src="/icons/target-dollar.png" alt="" className="w-6 h-6" />}
                  >
                    งบประมาณ
                  </MobileNavLink>
                  <MobileNavLink 
                href="/currency"
                onClick={toggleMenu}
                    icon={<img src="/icons/exchange.png" alt="" className="w-6 h-6" />}
                  >
                    อัตราแลกเปลี่ยน
                  </MobileNavLink>
                  <MobileNavLink 
                href="/analytics"
                onClick={toggleMenu}
                    icon={<img src="/icons/bars.png" alt="" className="w-6 h-6" />}
                  >
                    สรุปและวิเคราะห์
                  </MobileNavLink>
                  <MobileNavLink 
  href="/notifications"
                    badge={notificationCount}
  onClick={() => { resetAndFetchNotifications(localStorage.getItem('token')); toggleMenu(); }}
                    icon={
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
    </svg>
                    }
                  >
                    การแจ้งเตือน
                  </MobileNavLink>
                  <MobileNavLink 
                href="/profile"
                onClick={toggleMenu}
                    icon={
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"/>
                      </svg>
                    }
                  >
                    โปรไฟล์
                  </MobileNavLink>
              <button
                onClick={() => { handleLogout(); toggleMenu(); }}
                    className="flex items-center space-x-4 py-4 px-5 rounded-2xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white transition-all duration-300 shadow-lg shadow-[#ef4444]/20 hover:shadow-xl hover:scale-[1.01]"
              >
                    <div className="p-3 rounded-xl bg-white/20">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
                </svg>
                    </div>
                    <span className="text-lg font-semibold flex-1 text-left">ออกจากระบบ</span>
              </button>
            </div>
          )}
        </nav>

            {/* Main Content Area */}
        <main className={`flex-1 ${isLanding ? 'w-full p-0' : 'w-full'}`}>
          <div className={`${!isLanding && 'min-h-screen'}`}>
          {children}
          </div>
        </main>

            {/* Footer */}
            <footer className={`${isLanding ? 'bg-slate-900 border-transparent' : 'bg-white/50 backdrop-blur-sm border-slate-200'} border-t mt-auto`}>
              <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-600">
                    <Link href="/help" className="flex items-center space-x-3 hover:text-primary transition-all duration-300 text-sm font-medium group">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-primary/10 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                      </div>
                      <span>ศูนย์ช่วยเหลือ</span>
                </Link>
                    <Link href="/contact" className="flex items-center space-x-3 hover:text-primary transition-all duration-300 text-sm font-medium group">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-primary/10 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                      </div>
                  <span>ติดต่อเรา</span>
                </Link>
              </div>
                  <div className="text-center">
                    <p className="text-slate-500 text-sm">
                      © 2025 <span className="font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Balanz.IA</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">ระบบจัดการการเงินอัจฉริยะ</p>
              </div>
            </div>
          </div>
        </footer>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </body>
    </html>
  );
}