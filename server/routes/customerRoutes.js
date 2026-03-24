const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerHistory,
} = require('../controllers/customerController');

router.use(protect);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerHistory);

module.exports = router;