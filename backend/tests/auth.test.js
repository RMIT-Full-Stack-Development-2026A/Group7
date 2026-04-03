/**
 * Auth unit tests – no real DB needed, models are mocked.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── Minimal env setup ──────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';

// ── Mock mongoose models ───────────────────────────────────────────────────
jest.mock('../src/models/User', () => {
  const users = [];
  return {
    findOne: jest.fn(async (q) => {
      if (q.$or) {
        const [byEmail, byUsername] = q.$or;
        return users.find(
          (u) => u.email === byEmail.email || u.username === byUsername.username
        ) || null;
      }
      if (q._id) return users.find((u) => u._id === q._id) || null;
      return null;
    }),
    create: jest.fn(async (data) => {
      const u = { ...data, _id: `id_${Date.now()}`, save: jest.fn() };
      users.push(u);
      return u;
    }),
    _users: users,
  };
});

jest.mock('../src/config/tokenStore', () => ({
  revoke: jest.fn(),
  isRevoked: jest.fn(() => false),
}));

const authService = require('../src/modules/auth/service/auth.service');
const User = require('../src/models/User');

// ── Tests ──────────────────────────────────────────────────────────────────
describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User._users.length = 0;
  });

  // ── register ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('hashes the password and returns userId', async () => {
      User.findOne.mockResolvedValueOnce(null);
      const result = await authService.register({
        username: 'alice', email: 'alice@test.com',
        password: 'Secret@1', country: 'Vietnam',
      });
      expect(result.userId).toBeDefined();
      const created = User.create.mock.calls[0][0];
      expect(created.password).not.toBe('Secret@1');
      expect(await bcrypt.compare('Secret@1', created.password)).toBe(true);
    });

    it('throws 409 if email already exists', async () => {
      User.findOne.mockResolvedValueOnce({ email: 'alice@test.com', username: 'alice' });
      await expect(authService.register({
        username: 'alice2', email: 'alice@test.com',
        password: 'Secret@1', country: 'Vietnam',
      })).rejects.toMatchObject({ status: 409 });
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('returns a JWT token on valid credentials', async () => {
      const hashed = await bcrypt.hash('Secret@1', 10);
      User.findOne.mockResolvedValueOnce({
        _id: 'user1', username: 'alice', email: 'alice@test.com',
        role: 'player', premiumStatus: false,
        accountStatus: 'active', loginAttempts: 0, lockUntil: null,
        password: hashed,
        save: jest.fn(),
        toObject: jest.fn(() => ({ _id: 'user1', username: 'alice' })),
      });
      const { token } = await authService.login({ usernameOrEmail: 'alice', password: 'Secret@1' });
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, 'test_secret');
      expect(decoded.username).toBe('alice');
    });

    it('throws 401 on wrong password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      User.findOne.mockResolvedValueOnce({
        _id: 'user2', username: 'bob', email: 'bob@test.com',
        accountStatus: 'active', loginAttempts: 0, lockUntil: null,
        password: hashed, save: jest.fn(),
      });
      await expect(
        authService.login({ usernameOrEmail: 'bob', password: 'wrong' })
      ).rejects.toMatchObject({ status: 401 });
    });

    it('throws 403 for banned user', async () => {
      const hashed = await bcrypt.hash('Secret@1', 10);
      User.findOne.mockResolvedValueOnce({
        _id: 'user3', username: 'banned', email: 'banned@test.com',
        accountStatus: 'banned', loginAttempts: 0, lockUntil: null,
        password: hashed, save: jest.fn(),
      });
      await expect(
        authService.login({ usernameOrEmail: 'banned', password: 'Secret@1' })
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('calls tokenStore.revoke with the token', async () => {
      const { revoke } = require('../src/config/tokenStore');
      const exp = Math.floor(Date.now() / 1000) + 3600;
      await authService.logout('mytoken', { exp });
      expect(revoke).toHaveBeenCalledWith('mytoken', exp * 1000);
    });
  });
});
