const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerHistory,
  deleteCustomer,
} = require('../controllers/customerController');

router.use(protect);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerHistory);
router.delete('/:id', deleteCustomer);

module.exports = router;