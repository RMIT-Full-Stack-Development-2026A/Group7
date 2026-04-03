const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('../../../models/User');
const Plan = require('../../../models/Plan');
const Subscription = require('../../../models/Subscription');
const Payment = require('../../../models/Payment');

/**
 * Simulates a payment gateway call.
 * Returns { success, gatewayRef } after a short delay.
 */
async function simulateGateway(amount) {
  await new Promise((r) => setTimeout(r, 300)); // simulate network latency
  if (process.env.SIMULATE_PAYMENT_FAILURE === 'true') return { success: false };
  return { success: true, gatewayRef: `GW-${uuidv4()}` };
}

/**
 * POST /subscriptions/purchase
 * Body: { planId, paymentMethod, idempotencyKey? }
 *
 * Idempotent: if same idempotencyKey comes in twice, return the original result.
 * Uses a MongoDB session for atomicity: payment + subscription + user update
 * are rolled back together if anything fails.
 */
async function purchase(userId, { planId, paymentMethod, idempotencyKey }) {
  if (!planId || !paymentMethod) {
    const e = new Error('planId and paymentMethod are required'); e.status = 400; throw e;
  }

  // Idempotency: return existing result if key already used
  if (idempotencyKey) {
    const existing = await Payment.findOne({ idempotencyKey }).lean();
    if (existing) {
      const sub = await Subscription.findOne({ idempotencyKey }).lean();
      return { message: 'Already processed (idempotent)', payment: existing, subscription: sub };
    }
  }

  const plan = await Plan.findOne({ planId, active: true });
  if (!plan) { const e = new Error('Plan not found'); e.status = 404; throw e; }

  const user = await User.findById(userId);
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }

  // Simulate payment
  const { success, gatewayRef } = await simulateGateway(plan.price);

  const ikey = idempotencyKey || uuidv4();

  if (!success) {
    // Record failed payment and bail out — no subscription created
    await Payment.create({
      userId, planId, amount: plan.price, currency: plan.currency,
      paymentMethod, status: 'failed', idempotencyKey: ikey,
    });
    const e = new Error('Payment failed. Please try again.'); e.status = 402; throw e;
  }

  // Atomic write: payment + subscription + user update
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [payment] = await Payment.create([{
      userId, planId, amount: plan.price, currency: plan.currency,
      paymentMethod, status: 'success', gatewayRef, idempotencyKey: ikey,
    }], { session });

    const endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
    const [subscription] = await Subscription.create([{
      userId, planId, status: 'active', endDate, idempotencyKey: ikey,
    }], { session });

    await User.findByIdAndUpdate(userId, {
      premiumStatus: true,
      subscriptionEndDate: endDate,
    }, { session });

    await session.commitTransaction();
    session.endSession();

    return { message: 'Subscription activated!', payment, subscription };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function getActive(userId) {
  return Subscription.findOne({ userId, status: 'active', endDate: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = { purchase, getActive };
