const subService = require('../service/subscription.service');

async function purchase(req, res, next) {
  try {
    const result = await subService.purchase(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function mySubscription(req, res, next) {
  try {
    const sub = await subService.getActive(req.user.userId);
    res.json(sub);
  } catch (err) { next(err); }
}

module.exports = { purchase, mySubscription };
