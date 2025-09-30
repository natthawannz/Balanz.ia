"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Tesseract from 'tesseract.js';

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
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🍽️'); // เริ่มต้นด้วย Emoji เดี่ยว
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('สารสาธารณูปโภค');


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
        const defaultCat = updatedCategories.find(cat => cat.type === formData.type) || updatedCategories[0];
        if (defaultCat) {
          setFormData(prev => ({ ...prev, category: defaultCat._id }));
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
    if (newCategory.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) {
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
    } else if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      setError('หมวดหมู่นี้มีอยู่แล้ว');
    }
  };

  const deleteCategory = async (categoryId) => {
    const token = localStorage.getItem('token');
    try {
      // ตรวจสอบว่าหมวดหมู่ถูกใช้งานในงบประมาณหรือไม่
      const budgetRes = await fetch('http://localhost:5000/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const budgetData = await budgetRes.json();

      if (budgetRes.ok) {
        const isUsedInBudget = budgetData.some(
          budget => String(budget.category._id) === String(categoryId)
        );

        if (isUsedInBudget) {
          setError(
            'ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีการใช้งานในระบบงบประมาณ  '
          );
          return;
        }

        // ถ้าไม่ถูกใช้งาน ให้ถามยืนยันลบ
        if (
          window.confirm(
            `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categories.find(cat => cat._id === categoryId)?.name}"?`
          )
        ) {
          const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            await fetchCategories(token);
            if (formData.category === categoryId) {
              const defaultCat = categories.find(cat => cat.type === formData.type) || categories[0];
              setFormData(prev => ({ ...prev, category: defaultCat?._id || '' }));
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

    for (const cat of categories) {
      if (lowerText.includes(cat.name.toLowerCase()) && cat.type === newFormData.type) {
        newFormData.category = cat._id;
        break;
      }
    }

    const notesMatch = lowerText.match(/(หมายเหตุ|สำหรับ)\s*([\s\S]*)/);
    if (notesMatch) {
      newFormData.notes = notesMatch[2].trim();
    }

    setFormData(newFormData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    Tesseract.recognize(file, 'tha')
      .then(({ data: { text } }) => {
        setOcrResult(text);
        const lowerText = text.toLowerCase();
        let newParsedData = { ...parsedData, type: 'expense' };

        for (const cat of categories) {
          if (lowerText.includes(cat.name.toLowerCase()) && cat.type === newParsedData.type) {
            newParsedData.category = cat._id;
            break;
          }
        }

        const dateMatch = lowerText.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/) ||
          lowerText.match(/(\d{1,2})\s*(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*(\d{4})/);
        if (dateMatch) {
          let formattedDate;
          if (dateMatch[2].match(/\d{1,2}/)) {
            formattedDate = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
          } else {
            const thaiMonths = {
              'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
              'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
              'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
            };
            formattedDate = `${parseInt(dateMatch[3]) - 543}-${thaiMonths[dateMatch[2]]}-${dateMatch[1].padStart(2, '0')}`;
          }
          newParsedData.date = formattedDate;
        }

        newParsedData.notes = text.split('\n').slice(0, 2).join(' ').trim();
        setParsedData(newParsedData);
        setShowConfirmModal(true);
      })
      .catch((error) => {
        setError('เกิดข้อผิดพลาดในการอ่าน OCR: ' + error.message);
      })
      .finally(() => {
        setOcrLoading(false);
      });
  };

  const confirmOcrData = () => {
    setFormData(parsedData);
    setShowConfirmModal(false);
    setImage(null);
    setOcrResult('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.amount || formData.amount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
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

  return (
    <main className="container mx-auto px-6 py-8" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          เพิ่มรายการธุรกรรม
        </h1>
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
            </svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              step="1"
              min="0" // ป้องกันตัวเลขติดลบ
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value < 0 ? 0 : e.target.value, // ป้องกันกรอกด้วยการพิมพ์ติดลบ
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              placeholder="เช่น 500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ประเภท</label>
            <select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData({ ...formData, type: newType, category: '' });
                const defaultCat = categories.find(cat => cat.type === newType) || categories.find(cat => cat.type);
                if (defaultCat) {
                  setFormData(prev => ({ ...prev, category: defaultCat._id }));
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            >
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
            <div className="grid grid-cols-2 gap-4">
              {categories
                .filter(cat => cat.type === formData.type)
                .map((cat) => (
                  <div
                    key={cat._id}
                    className={`bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 ${formData.category === cat._id ? 'border-green-500 bg-green-50' : ''
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectCategory(cat._id)}
                      className="w-full text-center text-gray-800 font-medium flex flex-col items-center space-y-2"
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat._id)}
                      className="mt-3 w-full bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAddCategoryModal(true)}
              className="mt-4 w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              เพิ่มหมวดหมู่ใหม่
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">วันที่</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">หมายเหตุ (ถ้ามี)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="เช่น ซื้ออาหารที่ร้าน"
              rows="4"
            />
          </div>
          {isSpeechSupported && (
            <div>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className="w-full p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-white"
                style={{ backgroundColor: isRecording ? '#bd9c9c' : '#00C8D2' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isRecording ? '#c0b0b0' : '#00A3B3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isRecording ? '#d8c2c2' : '#00C8D2'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">อัพโหลดใบเสร็จ</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={ocrLoading}
            />
            {ocrLoading && <p className="text-center text-gray-600 mt-2">กำลังประมวลผล OCR...</p>}
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกธุรกรรม'}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>

        {showConfirmModal && parsedData && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => {
              // คลิกพื้นที่รอบ popup ปิด popup และ reset state
              setShowConfirmModal(false);
              setParsedData(null);
            }}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-lg mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()} // ป้องกันคลิกภายใน popup ปิด
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">ยืนยันข้อมูลจากใบเสร็จ</h3>
              <div className="space-y-3">
                <p><strong>จำนวนเงิน:</strong> {parsedData.amount || 'ไม่พบ'} บาท</p>
                <p><strong>ประเภท:</strong> {parsedData.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</p>
                <p>
                  <strong>หมวดหมู่:</strong> {categories.find(cat => cat._id === parsedData.category)?.name || 'ไม่พบหมวดหมู่'}
                </p>
                <p><strong>วันที่:</strong> {parsedData.date || 'ไม่พบ'}</p>
                <p><strong>เวลา:</strong> ไม่มี (ใช้ 00:00)</p>
                <p><strong>หมายเหตุ:</strong> {parsedData.notes || 'ไม่มี'}</p>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={confirmOcrData}
                  className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ยืนยัน
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setParsedData(null); // reset state
                  }}
                  className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}


        {showAddCategoryModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => {
              // คลิกพื้นที่นอก popup
              setShowAddCategoryModal(false);
              setNewCategory('');
              setSelectedIcon('🍽️');
              setNewCategoryType('expense');
              setSelectedCategoryGroup('สารสาธารณูปโภค');
            }}
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()} // ป้องกันการปิด popup เมื่อคลิกภายใน
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">เพิ่มหมวดหมู่ใหม่</h3>
              <div className="space-y-6">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="ชื่อหมวดหมู่ใหม่"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-700"
                />
                <select
                  value={selectedCategoryGroup}
                  onChange={(e) => setSelectedCategoryGroup(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-700"
                >
                  {availableIcons.map((group) => (
                    <option key={group.label} value={group.label}>
                      {group.label}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons
                    .find((group) => group.label === selectedCategoryGroup)
                    ?.value.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-3xl ${selectedIcon === icon ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100'
                          } border border-gray-200 transition-colors shadow-sm`}
                      >
                        {icon}
                      </button>
                    ))}
                </div>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-700"
                >
                  <option value="income">รายรับ</option>
                  <option value="expense">รายจ่าย</option>
                </select>
              </div>
              <div className="flex space-x-6 mt-8">
                <button
                  type="button"
                  onClick={addCategory}
                  className="flex-1 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
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

      </div>
    </main>
  );
}