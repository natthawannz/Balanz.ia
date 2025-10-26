"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputId = 'avatar-file-input';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your profile');
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser({ name: data.name, email: data.email });
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
            try { localStorage.setItem('avatarUrl', data.avatarUrl); } catch {}
          } else {
            const localAvatar = localStorage.getItem('avatarUrl');
            if (localAvatar) setAvatarUrl(localAvatar);
          }
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch profile');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: user.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ name: data.name, email: data.email });
        try { localStorage.setItem('name', data.name); } catch {}
        alert('Profile updated successfully');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const onPickFile = () => {
    const el = document.getElementById(fileInputId);
    if (el) el.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      // Preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to backend (best-effort)
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('http://localhost:5000/api/auth/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (res.ok && data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        try { localStorage.setItem('avatarUrl', data.avatarUrl); } catch {}
      } else {
        // Fallback to local preview
        try { localStorage.setItem('avatarUrl', avatarUrl); } catch {}
      }
    } catch (err) {
      console.error('Upload avatar failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/avatar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(()=>{});
    } finally {
      setUploading(false);
      setAvatarUrl('');
      try { localStorage.removeItem('avatarUrl'); } catch {}
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#299D91] mb-4">Personal Information</h2>
      <div className="bg-white rounded-xl shadow p-6">
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-center text-gray-600">Loading...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header row avatar + name + actions */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 1114 0H3z"/></svg>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-[#191919] flex-1">{user.name || 'Your name'}</h3>
                  <div className="flex gap-3">
                    <input id={fileInputId} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <button type="button" onClick={onPickFile} disabled={uploading} className="px-4 py-2 rounded-lg bg-[#299D91] text-white font-semibold hover:brightness-110 disabled:opacity-60">{uploading ? 'Uploading...' : 'Upload New Picture'}</button>
                    <button type="button" onClick={handleDeleteAvatar} className="px-4 py-2 rounded-lg border border-gray-300 text-[#191919] hover:bg-gray-50">Delete</button>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <div className="relative">
                    <input id="name" type="text" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 pr-10" placeholder="Your name"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z"/><path fillRule="evenodd" d="M2 13.5A4.5 4.5 0 016.5 9H7a4 4 0 014 4v3H2v-2.5z" clipRule="evenodd"/></svg>
                    </span>
                  </div>
                  <div className="relative">
                    <input id="email" type="email" value={user.email} readOnly className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 pr-10" placeholder="Email"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                    </span>
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="098xxxxxxxx" className="w-full px-4 py-3 rounded-lg border border-gray-300 pr-10"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h1.5a1 1 0 01.95.684l.5 1.497a1 1 0 01-.27 1.056L6.21 7.21a11.042 11.042 0 005.58 5.58l1.473-1.47a1 1 0 011.056-.27l1.497.5a1 1 0 01.684.95V14a2 2 0 01-2 2h-1C7.477 16 4 12.523 4 8V7a2 2 0 00-2-2z"/></svg>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Street Number" className="w-full px-4 py-3 rounded-lg border border-gray-300"/>
                    <input type="text" placeholder="Apt / House Number" className="w-full px-4 py-3 rounded-lg border border-gray-300"/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="w-full px-4 py-3 rounded-lg border border-gray-300 appearance-none bg-white"><option>City</option></select>
                    <select className="w-full px-4 py-3 rounded-lg border border-gray-300 appearance-none bg-white"><option>State</option></select>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-[#299D91] text-white font-bold hover:brightness-110">บันทึกข้อมูล</button>
                  <a href="/change-password" className="px-4 py-3 rounded-xl border border-gray-300 text-[#191919] hover:bg-gray-50 whitespace-nowrap">เปลี่ยนรหัสผ่าน</a>
                </div>
              </form>
            )}
          </div>
    </div>
  );
}
