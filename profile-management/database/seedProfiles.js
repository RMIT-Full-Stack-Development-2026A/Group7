const { connectDB, closeDB } = require('../database/dbConnect');

async function seedProfiles() {
  try {
    console.log('🌱 Seeding user profiles...');

    const db = await connectDB();
    const profiles = db.collection('profiles');

    // Clear existing profiles (optional)
    // await profiles.deleteMany({});

    const usersData = [
      // Admin account
      {
        userId: 'user-001',
        username: 'TheOneWhoAsked',
        email: 'TowaTGK@gmail.com',
        password: 'hashedPassword123',
        country: 'Vietnam',
        rank: 'Gold III',
        elo: 1847,
        level: 25,
        gamesPlayed: 156,
        isAdmin: true,
        avatar: 'https://imgs.search.brave.com/C2nuScHmfw9UxSbEfgpPErzoYJJgY7fco8288B7CyZE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2aWV3LnJlZGRpdC5pdC9jb21lLXRvLXRoaW5rLW9mLWl0LWktaGF2ZS1uby1pZGVhLW9mLXdobzotdGhpcy1tYW1iby10aGF0LXYwLWNnaTZmZTJ5dXlnZjEuanBlZz93aWR0aD01NTgmZm9ybWF0PXBqcGcmYXV0bz13ZWJwJnM9OTU0ZTQ5MTYwZGM1OTdiMWE1ODQwOWI1NzFlZDQyMDM1NjRkNDI0MA',
        gameHistory: [
          { id: 'ABC123', opponent: 'ShadowNinja', result: 'Win', score: '3-1', date: '2026-02-15' },
          { id: 'DEF456', opponent: 'DragonMaster', result: 'Loss', score: '1-3', date: '2026-02-09' },
          { id: 'GHI789', opponent: 'StarPlayer', result: 'Win', score: '3-2', date: '2026-01-28' },
          { id: 'JKL012', opponent: 'NeoNinja', result: 'Win', score: '3-0', date: '2026-01-20' },
          { id: 'MNO345', opponent: 'PixelPirate', result: 'Loss', score: '2-3', date: '2026-01-15' },
        ],
        createdAt: new Date('2025-06-01'),
        updatedAt: new Date(),
      },
      // Friend request senders / Challenge senders
      {
        userId: 'user-002',
        username: 'ShadowNinja',
        email: 'shadow@example.com',
        password: 'hashedPassword456',
        country: 'Japan',
        rank: 'Silver I',
        elo: 1620,
        level: 18,
        gamesPlayed: 89,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowNinja',
        gameHistory: [
          { id: 'ABC123', opponent: 'TheOneWhoAsked', result: 'Loss', score: '1-3', date: '2026-02-15' },
          { id: 'SNJ001', opponent: 'StarPlayer', result: 'Win', score: '3-1', date: '2026-02-10' },
        ],
        createdAt: new Date('2025-08-15'),
        updatedAt: new Date(),
      },
      {
        userId: 'user-003',
        username: 'DragonMaster',
        email: 'dragon@example.com',
        password: 'hashedPassword789',
        country: 'Korea',
        rank: 'Diamond II',
        elo: 2100,
        level: 32,
        gamesPlayed: 210,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DragonMaster',
        gameHistory: [
          { id: 'DEF456', opponent: 'TheOneWhoAsked', result: 'Win', score: '3-1', date: '2026-02-09' },
          { id: 'DRM001', opponent: 'NeoNinja', result: 'Win', score: '3-2', date: '2026-02-08' },
        ],
        createdAt: new Date('2025-05-10'),
        updatedAt: new Date(),
      },
      // Match history opponents
      {
        userId: 'user-004',
        username: 'StarPlayer',
        email: 'star@example.com',
        password: 'hashedPassword101',
        country: 'USA',
        rank: 'Platinum III',
        elo: 1950,
        level: 28,
        gamesPlayed: 175,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StarPlayer',
        gameHistory: [
          { id: 'GHI789', opponent: 'TheOneWhoAsked', result: 'Loss', score: '2-3', date: '2026-01-28' },
          { id: 'STR001', opponent: 'ShadowNinja', result: 'Loss', score: '1-3', date: '2026-02-10' },
        ],
        createdAt: new Date('2025-07-20'),
        updatedAt: new Date(),
      },
      {
        userId: 'user-005',
        username: 'NeoNinja',
        email: 'neo@example.com',
        password: 'hashedPassword102',
        country: 'Singapore',
        rank: 'Gold II',
        elo: 1780,
        level: 22,
        gamesPlayed: 120,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NeoNinja',
        gameHistory: [
          { id: 'JKL012', opponent: 'TheOneWhoAsked', result: 'Loss', score: '0-3', date: '2026-01-20' },
          { id: 'NEO001', opponent: 'DragonMaster', result: 'Loss', score: '2-3', date: '2026-02-08' },
        ],
        createdAt: new Date('2025-09-05'),
        updatedAt: new Date(),
      },
      {
        userId: 'user-006',
        username: 'PixelPirate',
        email: 'pixel@example.com',
        password: 'hashedPassword103',
        country: 'Brazil',
        rank: 'Gold IV',
        elo: 1650,
        level: 19,
        gamesPlayed: 95,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PixelPirate',
        gameHistory: [
          { id: 'MNO345', opponent: 'TheOneWhoAsked', result: 'Win', score: '3-2', date: '2026-01-15' },
          { id: 'PXL001', opponent: 'StarPlayer', result: 'Loss', score: '1-3', date: '2026-01-25' },
        ],
        createdAt: new Date('2025-10-12'),
        updatedAt: new Date(),
      },
      {
        userId: 'user-007',
        username: 'RogueRey',
        email: 'rogue@example.com',
        password: 'hashedPassword104',
        country: 'Canada',
        rank: 'Silver II',
        elo: 1550,
        level: 16,
        gamesPlayed: 78,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RogueRey',
        gameHistory: [],
        createdAt: new Date('2025-11-03'),
        updatedAt: new Date(),
      },
      {
        userId: 'user-008',
        username: 'RandomAhhOpponent',
        email: 'random@example.com',
        password: 'hashedPassword105',
        country: 'Germany',
        rank: 'Bronze I',
        elo: 1200,
        level: 8,
        gamesPlayed: 32,
        isAdmin: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RandomAhhOpponent',
        gameHistory: [],
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date(),
      },
    ];

    // Upsert profiles (update if exists, insert if not)
    for (const user of usersData) {
      await profiles.updateOne(
        { userId: user.userId },
        { $set: user },
        { upsert: true }
      );
    }

    console.log(`✅ Seeded ${usersData.length} user profiles!`);
    console.log('📋 Users created:');
    usersData.forEach(user => console.log(`   - ${user.username} (${user.rank})`));

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

seedProfiles();
