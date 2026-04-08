const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amountUSD: { type: Number, required: true },
  method: { type: String, required: true },
  transactionId: { type: String, required: true, index: true },
  status: { type: String, enum: ['Success','Failed','Pending'], default: 'Success' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
