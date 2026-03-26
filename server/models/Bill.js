const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    qty: { type: Number, default: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNo: { type: Number, unique: true, required: true },
    customer: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      address: { type: String, default: '' },
    },
    date: { type: Date, default: Date.now },
    items: [itemSchema],
    total: { type: Number, required: true },
    warrantyMonths: { type: Number, default: 12 },
    warrantyExpiry: { type: Date },
    language: { type: String, enum: ['en', 'mr'], default: 'en' },
    replacementCharges: { type: Number, default: 800 },
    notes: { type: String, default: '' },
    costPrice: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);