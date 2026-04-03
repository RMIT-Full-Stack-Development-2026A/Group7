const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planId:      { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  currency:    { type: String, default: 'USD' },
  durationDays:{ type: Number, default: 30 },
  features:    [String],
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
