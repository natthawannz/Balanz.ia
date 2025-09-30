const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '🌐',
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  // ใช้ compound index เพื่อให้ name unique ต่อ userId
  indexes: [{ key: { userId: 1, name: 1 }, unique: true }]
});

module.exports = mongoose.model('Category', categorySchema);