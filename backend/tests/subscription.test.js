/**
 * Subscription integration test – uses mongodb-memory-server for a real DB.
 * Install mongodb-memory-server as devDep if you want these to run:
 *   npm i -D mongodb-memory-server
 *
 * For CI without mongodb-memory-server the test is skipped automatically.
 */
let MongoMemoryServer;
try { ({ MongoMemoryServer } = require('mongodb-memory-server')); } catch { /* skip */ }

const mongoose = require('mongoose');
process.env.JWT_SECRET = 'test_secret';

const User         = require('../src/models/User');
const Plan         = require('../src/models/Plan');
const Subscription = require('../src/models/Subscription');
const Payment      = require('../src/models/Payment');

const describe_ = MongoMemoryServer ? describe : describe.skip;

describe_('Subscription Service (integration)', () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}), Plan.deleteMany({}),
      Subscription.deleteMany({}), Payment.deleteMany({}),
    ]);
  });

  it('creates payment + subscription and sets premiumStatus = true', async () => {
    const bcrypt = require('bcryptjs');
    const user = await User.create({
      username: 'subuser', email: 'sub@test.com',
      password: await bcrypt.hash('pass', 10),
      country: 'Vietnam', role: 'player',
    });

    await Plan.create({
      planId: 'monthly-gold', name: 'Gold', price: 10,
      currency: 'USD', durationDays: 30, active: true,
    });

    const subService = require('../src/modules/subscription/service/subscription.service');
    const result = await subService.purchase(user._id, {
      planId: 'monthly-gold',
      paymentMethod: 'wallet',
      idempotencyKey: 'test-ikey-001',
    });

    expect(result.payment.status).toBe('success');
    expect(result.subscription.status).toBe('active');

    const updated = await User.findById(user._id);
    expect(updated.premiumStatus).toBe(true);
    expect(updated.subscriptionEndDate).toBeDefined();
  });

  it('is idempotent – second call with same key returns original result', async () => {
    const bcrypt = require('bcryptjs');
    const user = await User.create({
      username: 'subuser2', email: 'sub2@test.com',
      password: await bcrypt.hash('pass', 10),
      country: 'Vietnam', role: 'player',
    });
    await Plan.create({
      planId: 'monthly-gold', name: 'Gold', price: 10,
      currency: 'USD', durationDays: 30, active: true,
    });

    const subService = require('../src/modules/subscription/service/subscription.service');
    const key = 'test-ikey-002';
    await subService.purchase(user._id, { planId: 'monthly-gold', paymentMethod: 'wallet', idempotencyKey: key });
    const second = await subService.purchase(user._id, { planId: 'monthly-gold', paymentMethod: 'wallet', idempotencyKey: key });

    expect(second.message).toMatch(/idempotent/i);

    // Only one payment record should exist
    const payments = await Payment.countDocuments({ userId: user._id });
    expect(payments).toBe(1);
  });
});
