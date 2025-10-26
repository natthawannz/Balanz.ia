"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CategoryPopup from './CategoryPopup'; 

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🍽️');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('สารสาธารณูปโภค');
  const [selectedTag, setSelectedTag] = useState('');

  const availableIcons = [
    { value: ['💡', '🚰', '🔥', '📶', '🛢️', '🔌', '📡', '💧', '⚡'], label: 'สารสาธารณูปโภค' },
    { value: ['🚗', '⛽', '🚙', '🅿️', '🚦', '🚘', '🛣️', '🚖', '🔧'], label: 'รถยนต์' },
    { value: ['💰', '📈', '🏦', '💳', '💵', '💸', '🧾', '💷', '💎'], label: 'การเงิน' },
    { value: ['👨‍👩‍👧‍👦', '🍼', '🎒', '🧸', '👶', '👧', '👦', '🏡', '👩‍🍼'], label: 'ครอบครัวและเด็ก' },
    { value: ['🛍️', '🎁', '👗', '👟', '💄', '⌚', '👒', '👜', '💍', '👕'], label: 'ช้อปปิ้ง' },
    { value: ['🍽️', '🍹', '🍔', '🍜', '🍕', '🥗', '🥩', '🍱', '🍩', '🍊'], label: 'อาหารและเครื่องดื่ม' },
    { value: ['🎓', '📚', '🖊️', '🏫', '📖', '✏️', '📒', '🧮', '🧑‍🏫', '📎'], label: 'การศึกษา' },
    { value: ['🎬', '🎵', '🎮', '📺', '🎤', '🎧', '🎨', '🎲', '🎷', '📸'], label: 'บันเทิง' },
    { value: ['🩺', '💊', '🏥', '🧘', '🥗', '🩹', '🧴', '⚕️', '🚑'], label: 'สุขภาพ' },
    { value: ['📦', '🧰', '📌', '🔑', '🗂️', '✂️', '📎', '🔨', '🧾'], label: 'เบ็ดเตล็ด' },
    { value: ['🏠', '🛋️', '🪑', '🚪', '🖼️', '🛏️', '🧹'], label: 'บ้าน' },
    { value: ['🐶', '🐱', '🐾', '🐟', '🦜', '🐇', '🐢', '🐕', '🐈', '🦎'], label: 'สัตว์เลี้ยง' },
    { value: ['🚌', '🚆', '🚲', '🚕', '🚤', '🚉', '🚄', '🚝', '🚍', '🛺'], label: 'การเดินทาง' },
    { value: ['✈️', '🗺️', '🏖️', '🏔️', '🛳️', '🛩️', '🏝️', '🛤️', '🗽', '🏯'], label: 'ท่องเที่ยว' },
    { value: ['🤲', '❤️', '🙏', '🎗️', '🕊️', '💝', '📦', '🍲', '💟'], label: 'บริจาค' },
    { value: ['🧴', '👕', '🩳', '👟', '🧼', '🧴', '💅', '🧢'], label: 'ของใช้ส่วนตัว' },
    { value: ['🏨', '🛏️', '🛎️', '🧳', '🚪', '🍽️', '🛋️', '🏩', '🛁'], label: 'ที่พักโรงแรม' },
    { value: ['🌳', '🌻', '🪴', '🌹', '🌿', '🍀', '🌲', '🌼', '🪵', '🌱'], label: 'จัดสวน' },
    { value: ['⚽', '🏀', '🏋️', '🏊', '🚴', '🎾', '🏐', '🥊', '⛳', '🏸'], label: 'กีฬา' },
    { value: ['💞', '💌', '🌹', '🥂', '💍', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '❤️', '😘'], label: 'เพื่อน-คนรัก' },
    { value: ['💻', '🖥️', '⌨️', '🖱️', '📱', '📡', '🤖', '💾', '🕹️', '🔋'], label: 'เทคโนโลยี/ดิจิทัล' },
    { value: ['💼', '🗂️', '📊', '📅', '🖊️', '📇', '📠', '🏢', '🧑‍💼', '🗃️'], label: 'งาน/อาชีพ' },
    { value: ['📸', '🎨', '🎭', '🎹', '🖌️', '🎤', '🎧', '🧵', '🎯', '📷'], label: 'ศิลปะ/งานสร้างสรรค์' },
    { value: ['🎂', '🎉', '🎊', '🎈', '🍰', '🥂', '🍾', '🎇', '🎆', '🍻'], label: 'งานเลี้ยง/เทศกาล' },
    { value: ['📖', '📰', '✏️', '📑', '📝', '📓', '📒', '📚', '📔', '🖋️'], label: 'การเรียนรู้/ศึกษาเพิ่มเติม' },
    { value: ['🧳', '🚖', '🚉', '🛫', '🛬', '🚢', '🚄', '🚲', '🚙', '🛣️'], label: 'โลจิสติกส์/การขนส่ง' },
    { value: ['💤', '🛌', '🛁', '🧼', '🪑', '🕯️', '🧖', '📺', '🎧'], label: 'การพักผ่อน' },
    { value: ['🧑‍🍳', '🥗', '🍱', '🥘', '🍲', '🍳', '🥩', '🥖', '🍜', '🍕'], label: 'ครัว/การปรุงอาหาร' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setIsLoggedIn(true);
      fetchCategories(token);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = 'th-TH';
      recog.interimResults = true;
      recog.continuous = true;
      setRecognition(recog);
      setIsSpeechSupported(true);
    }
  }, []);

  const fetchCategories = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        let updatedCategories = data || [];
        setCategories(updatedCategories);
        
        if (!formData.category) {
            const defaultCat = updatedCategories.find(cat => cat.type === formData.type) || updatedCategories[0];
            if (defaultCat) {
              setFormData(prev => ({ ...prev, category: defaultCat._id }));
            }
        }
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงหมวดหมู่');
        setCategories([]);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
      setCategories([]);
    }
  };

  const addCategory = async () => {
    if (newCategory.trim()) {
      const isDuplicate = categories.some(
        (cat) =>
          cat.name.toLowerCase() === newCategory.trim().toLowerCase() &&
          cat.type === newCategoryType
      );
      if (!isDuplicate) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newCategory.trim(), icon: selectedIcon, type: newCategoryType }),
          });
          const data = await res.json();
          if (res.ok) {
            await fetchCategories(token);
            setNewCategory('');
            setSelectedIcon('🍽️');
            setNewCategoryType('expense');
            setShowAddCategoryModal(false);
          } else {
            setError(data.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
          }
        } catch (error) {
          setError('เกิดข้อผิดพลาด: ' + error.message);
        }
      } else {
        setError('หมวดหมู่นี้มีอยู่แล้วในประเภทนี้');
      }
    } else {
      setError('กรุณากรอกชื่อหมวดหมู่');
    }
  };

  const deleteCategory = async (categoryId) => {
    const token = localStorage.getItem('token');
    try {
      const budgetRes = await fetch('http://localhost:5000/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const budgetData = await budgetRes.json();

      if (budgetRes.ok) {
        const isUsedInBudget = budgetData.some(
          budget => budget.category && String(budget.category._id) === String(categoryId)
        );

        if (isUsedInBudget) {
          setError(
            'ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีการใช้งานในระบบงบประมาณ'
          );
          return;
        }

        if (
          window.confirm(
            `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categories.find(cat => cat._id === categoryId)?.name}"? การลบจะรวมถึงการลบข้อมูลประวัติหมวดหมู่ในรายการธุรกรรมด้วย`
          )
        ) {
          const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            await fetchCategories(token);
            if (formData.category === categoryId) {
              const remainingCategories = categories.filter(cat => cat.type === formData.type && cat._id !== categoryId);
              const newDefaultCat = remainingCategories[0];
              setFormData(prev => ({ ...prev, category: newDefaultCat?._id || '' }));
            }
          } else {
            const data = await res.json();
            setError(data.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
          }
        }
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const selectCategory = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const startRecording = () => {
    if (!recognition) return;
    setIsRecording(true);
    setTranscript('');
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(transcript);
      parseTranscript(transcript);
    };
    recognition.onerror = (event) => {
      setError('เกิดข้อผิดพลาดในการบันทึกเสียง: ' + event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const parseTranscript = (text) => {
    const lowerText = text.toLowerCase();
    let newFormData = { ...formData };

    const amountMatch = lowerText.match(/(\d{1,3}(,\d{3})*(\.\d+)?)/);
    if (amountMatch) {
      const rawAmount = amountMatch[0].replace(/,/g, '');
      newFormData.amount = rawAmount;
    }

    if (lowerText.includes('รับ') || lowerText.includes('รายรับ')) {
      newFormData.type = 'income';
    } else if (lowerText.includes('จ่าย') || lowerText.includes('รายจ่าย')) {
      newFormData.type = 'expense';
    }

    const potentialCategory = categories.find(cat => 
        lowerText.includes(cat.name.toLowerCase()) && cat.type === newFormData.type
    );
    if (potentialCategory) {
        newFormData.category = potentialCategory._id;
    }

    const notesMatch = lowerText.match(/(หมายเหตุ|สำหรับ)\s*([\s\S]*)/);
    if (notesMatch) {
      newFormData.notes = notesMatch[2].trim();
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      setLoading(false);
      return;
    }

    if (!formData.category) {
        setError('กรุณาเลือกหมวดหมู่');
        setLoading(false);
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (formData.date > today) {
      setError('วันที่ต้องไม่เกินวันปัจจุบัน');
      setLoading(false);
      return;
    }

    const transactionDate = new Date(`${formData.date}T00:00:00.000+07:00`);
    if (isNaN(transactionDate.getTime())) {
      setError(`รูปแบบวันที่ผิดพลาด กรุณาตรวจสอบ (ได้แก่ ${formData.date})`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }
      window.location.href = '/dashboard';
    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
      console.error('Error details:', error);
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  const selectedCategory = categories.find(cat => cat._id === formData.category);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5]" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl mx-auto overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b">
          <Link href="/dashboard" className="text-[#299D91] font-semibold hover:underline">Cancel</Link>
          <h2 className="text-lg font-bold text-gray-800">บันทึกรายรับ-รายจ่าย</h2>
          <button form="txn-form" type="submit" className="text-[#299D91] font-semibold hover:underline">Save</button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg m-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
            </svg>
            {error}
          </div>
        )}

        <form id="txn-form" onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              step="1"
              min="0" 
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value < 0 ? 0 : e.target.value, 
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-gray-700"
              placeholder="เช่น 500"
              required
            />
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
            <div className="inline-flex bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`px-5 py-3 font-semibold transition-colors ${formData.type==='income' ? 'bg-[#299D91] text-white' : 'bg-white text-gray-700'}`}
              >
                รายรับ
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`px-5 py-3 font-semibold transition-colors ${formData.type==='expense' ? 'bg-[#299D91] text-white' : 'bg-white text-gray-700'}`}
              >
                รายจ่าย
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
            <CategoryPopup
              categories={categories}
              formData={formData}
              selectCategory={selectCategory}
              deleteCategory={deleteCategory}
              setShowAddCategoryModal={setShowAddCategoryModal}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-gray-700"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">โน็ต (ถ้ามี)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-gray-700"
              placeholder="เช่น ซื้ออาหารที่ร้าน ศศิ"
              rows="3"
            />
          </div>

          {/* Voice Recording */}
          {isSpeechSupported && (
            <div>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className="w-full p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-white"
                style={{ backgroundColor: isRecording ? '#d8c2c2' : '#00C8D2' }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clipRule="evenodd" />
                </svg>
                <span>{isRecording ? 'หยุดการบันทึกเสียง' : 'บันทึกด้วยเสียง'}</span>
              </button>
              {transcript && (
                <div className="mt-3 p-3 bg-gray-100 rounded-lg text-gray-700">
                  <p className="text-sm">ข้อความที่บันทึก: {transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#299D91] text-white rounded-lg hover:bg-[#238A80] transition-colors disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center transition-colors font-semibold"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20"
          onClick={() => {
            setShowAddCategoryModal(false);
            setNewCategory('');
            setSelectedIcon('🍽️');
            setNewCategoryType('expense');
            setSelectedCategoryGroup('สารสาธารณูปโภค');
          }}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">เพิ่มหมวดหมู่ใหม่</h3>
            <div className="space-y-6">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="ชื่อหมวดหมู่ใหม่"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-lg text-gray-700"
              />
              <select
                value={selectedCategoryGroup}
                onChange={(e) => setSelectedCategoryGroup(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-lg text-gray-700"
              >
                {availableIcons.map((group) => (
                  <option key={group.label} value={group.label}>
                    {group.label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-6 gap-2 h-36 overflow-y-auto p-2 border rounded-lg">
                {availableIcons
                  .find((group) => group.label === selectedCategoryGroup)
                  ?.value.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      type="button"
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-3xl ${selectedIcon === icon ? 'bg-[#299D91] text-white' : 'bg-white hover:bg-gray-100'
                        } border border-gray-200 transition-colors shadow-sm`}
                    >
                      {icon}
                    </button>
                  ))}
              </div>
              <select
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#299D91] text-lg text-gray-700"
              >
                <option value="income">รายรับ</option>
                <option value="expense">รายจ่าย</option>
              </select>
            </div>
            <div className="flex space-x-6 mt-8">
              <button
                type="button"
                onClick={addCategory}
                className="flex-1 p-4 bg-[#299D91] text-white rounded-lg hover:bg-[#238A80] transition-colors text-lg font-medium"
              >
                ยืนยัน
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory('');
                  setSelectedIcon('🍽️');
                  setNewCategoryType('expense');
                  setSelectedCategoryGroup('สารสาธารณูปโภค');
                }}
                className="flex-1 p-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-lg font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}