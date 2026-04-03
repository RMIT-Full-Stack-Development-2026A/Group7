const express = require('express');
const router = express.Router();
const Plan = require('../../models/Plan');

router.get('/', async (_req, res, next) => {
  try {
    const plans = await Plan.find({ active: true }).lean();
    res.json(plans);
  } catch (e) { next(e); }
});

router.get('/:planId', async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ planId: req.params.planId, active: true }).lean();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (e) { next(e); }
});

module.exports = router;
