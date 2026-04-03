const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId:         { type: String, required: true },
  amount:         { type: Number, required: true },
  currency:       { type: String, default: 'USD' },
  paymentMethod:  { type: String, required: true },
  status:         { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  gatewayRef:     { type: String },
  idempotencyKey: { type: String, unique: true, sparse: true },
}, { timestamps: true });

paymentSchema.index({ userId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
