const Bill = require('../models/Bill');
const Customer = require('../models/Customer');

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const getNextBillNo = async () => {
  const lastBill = await Bill.findOne().sort({ billNo: -1 }).select('billNo');
  return lastBill ? lastBill.billNo + 1 : 1;
};

// Create new bill
exports.createBill = async (req, res) => {
  try {
    const {
      customer,
      items = [],
      notes = '',
      costPrice = 0,
      date,
    } = req.body;

    if (!customer || !customer.name || !customer.mobile) {
      return res.status(400).json({ message: 'Customer name and mobile are required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    const normalizedItems = items.map((item) => {
      const qty = Number(item.qty || 1);
      const rate = Number(item.rate || 0);
      const amount =
        item.amount !== undefined ? Number(item.amount) : qty * rate;

      return {
        description: item.description,
        qty,
        rate,
        amount,
      };
    });

    const total = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
    const billNo = await getNextBillNo();
    const billDate = date ? new Date(date) : new Date();
    const warrantyMonths = 18;
    const warrantyExpiry = addMonths(billDate, warrantyMonths);
    const finalCostPrice = Number(costPrice || 0);
    const profit = total - finalCostPrice;

    const bill = await Bill.create({
      billNo,
      customer: {
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address || '',
      },
      date: billDate,
      items: normalizedItems,
      total,
      notes,
      costPrice: finalCostPrice,
      profit,
      warrantyMonths,
      warrantyExpiry,
      replacementCharges: 800,
    });

    await Customer.findOneAndUpdate(
      { mobile: customer.mobile },
      {
        $set: {
          name: customer.name,
          mobile: customer.mobile,
          address: customer.address || '',
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, bill });
  } catch (err) {
    console.error('Create Bill Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { 'customer.name': { $regex: search, $options: 'i' } },
            { 'customer.mobile': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Bill.countDocuments(query);

    res.json({
      bills,
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Get Bills Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single bill
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    console.error('Get Bill By ID Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get bill by bill number
exports.getBillByNumber = async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNo: Number(req.params.billNo) });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    console.error('Get Bill By Number Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const { items = [], notes = '', costPrice = 0, customer } = req.body;

    const normalizedItems = items.map((item) => {
      const qty = Number(item.qty || 1);
      const rate = Number(item.rate || 0);
      const amount =
        item.amount !== undefined ? Number(item.amount) : qty * rate;

      return {
        description: item.description,
        qty,
        rate,
        amount,
      };
    });

    const total = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
    const finalCostPrice = Number(costPrice || 0);
    const profit = total - finalCostPrice;

    const updateData = {
      items: normalizedItems,
      notes,
      total,
      costPrice: finalCostPrice,
      profit,
    };

    if (customer) {
      updateData.customer = {
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address || '',
      };
    }

    const bill = await Bill.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    res.json({ success: true, bill });
  } catch (err) {
    console.error('Update Bill Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) {
    console.error('Delete Bill Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const monthly = await Bill.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalRevenue: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          totalBills: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const overall = await Bill.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          totalBills: { $sum: 1 },
        },
      },
    ]);

    res.json({
      monthly,
      overall: overall[0] || {
        totalRevenue: 0,
        totalProfit: 0,
        totalBills: 0,
      },
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: err.message });
  }
};