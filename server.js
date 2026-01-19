const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows Frontend to talk to Backend
app.use(express.json()); // Allows us to parse JSON bodies

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/budgetbuddy';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// --- THE DATA MODEL (Matches our Contract) ---
const TransactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true }, // 'income' or 'expense'
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- API ROUTES ---

// 1. GET All Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST New Transaction
app.post('/api/transactions', async (req, res) => {
  const { description, amount, type, category } = req.body;

  try {
    const newTransaction = new Transaction({
      description,
      amount,
      type,
      category
    });
    const savedTransaction = await newTransaction.save();
    res.json(savedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. DELETE Transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
