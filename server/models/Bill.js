const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  qty: { type: Number, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  billNo: { type: Number, unique: true },
  customer: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String },
  },
  date: { type: Date, default: Date.now },
  items: [itemSchema],
  total: { type: Number, required: true },
  warrantyMonths: { type: Number, default: 18 },
  warrantyExpiry: { type: Date },
  replacementCharges: { type: Number, default: 800 },
  notes: { type: String },
  // For profit tracking
  costPrice: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate bill number before saving
billSchema.pre('save', async function (next) {
  if (!this.billNo) {
    const lastBill = await mongoose.model('Bill').findOne().sort({ billNo: -1 });
    this.billNo = lastBill ? lastBill.billNo + 1 : 1;
  }
  // Auto-calculate warranty expiry from date
  if (this.date && this.warrantyMonths) {
    const expiry = new Date(this.date);
    expiry.setMonth(expiry.getMonth() + this.warrantyMonths);
    this.warrantyExpiry = expiry;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);