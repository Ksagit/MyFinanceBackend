require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5001;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
});

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 },
  month: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Budget = mongoose.model("Budget", budgetSchema);

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({
      date: -1,
      createdAt: -1,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  const transaction = new Transaction({
    type: req.body.type,
    category: req.body.category,
    amount: req.body.amount,
    date: req.body.date,
    description: req.body.description,
  });
  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/budgets", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/budgets", async (req, res) => {
  const budget = new Budget({
    category: req.body.category,
    limit: req.body.limit,
    month: req.body.month,
  });
  try {
    const newBudget = await budget.save();
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/budgets/:id", async (req, res) => {
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBudget)
      return res.status(404).json({ message: "Budget not found" });
    res.json(updatedBudget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/budgets/:id", async (req, res) => {
  try {
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
    if (!deletedBudget)
      return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
