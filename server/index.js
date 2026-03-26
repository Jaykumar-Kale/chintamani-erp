const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Chintamani ERP API is running!' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully!!!!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} succcessfully!!!!`);
    });
  })
  .catch((err) => console.log('❌ DB Error:', err));
