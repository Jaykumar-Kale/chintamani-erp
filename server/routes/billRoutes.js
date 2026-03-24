const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createBill,
  getAllBills,
  getBillById,
  getBillByNumber,
  updateBill,
  deleteBill,
  getAnalytics,
} = require('../controllers/billController');

router.use(protect); // All bill routes require login

router.post('/', createBill);
router.get('/', getAllBills);
router.get('/analytics', getAnalytics);
router.get('/number/:billNo', getBillByNumber);
router.get('/:id', getBillById);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

module.exports = router;