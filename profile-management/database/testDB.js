const { connectDB, closeDB } = require('../database/dbConnect');

async function testDB() {
  try {
    console.log('🔄 Testing MongoDB connection...');

    const db = await connectDB();
    console.log('✅ Connected successfully!');

    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));

    // Test profile collection
    const profiles = db.collection('profiles');
    const sampleProfile = {
      userId: 'test-user-123',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedTestPassword',
      avatar: 'test-avatar.png',
      level: 1,
      gamesPlayed: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert test profile
    const insertResult = await profiles.insertOne(sampleProfile);
    console.log('✅ Inserted test profile:', insertResult.insertedId);

    // Find the profile
    const foundProfile = await profiles.findOne({ userId: 'test-user-123' });
    console.log('✅ Retrieved profile:', foundProfile.username);

    // Clean up
    await profiles.deleteOne({ userId: 'test-user-123' });
    console.log('🧹 Cleaned up test data');

    console.log('🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

testDB();