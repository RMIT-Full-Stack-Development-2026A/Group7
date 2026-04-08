const User = require('../models/User');

async function createUser(doc) {
  return User.create(doc);
}

async function findByEmail(email) {
  return User.findOne({ email }).lean();
}

async function findById(id) {
  return User.findById(id);
}

async function updateById(id, patch) {
  return User.findByIdAndUpdate(id, patch, { new: true });
}

module.exports = { createUser, findByEmail, findById, updateById };
