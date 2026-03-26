const Customer = require('../models/Customer');
const Bill = require('../models/Bill');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get customer with all their bills
exports.getCustomerHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const bills = await Bill.find({ 'customer.mobile': customer.mobile })
      .sort({ createdAt: -1 });

    // Check warranty status for each bill
    const billsWithWarranty = bills.map((bill) => {
      const now = new Date();
      const warrantyStatus =
        bill.warrantyExpiry > now ? 'Active ✅' : 'Expired ❌';
      return { ...bill.toObject(), warrantyStatus };
    });

    res.json({ customer, bills: billsWithWarranty });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete customer and all their bills
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Delete all bills associated with this customer
    await Bill.deleteMany({ 'customer.mobile': customer.mobile });

    // Delete the customer
    await Customer.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Customer and all their bills deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};