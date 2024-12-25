import { DatabaseClient } from '../client/client';
import { logger } from '../utils/logger';

async function testDatabase() {
  const client = new DatabaseClient();

  try {
    // Connect to the server
    await client.connect();
    logger.info('Connected successfully');

    // Register a new user
    logger.info('Testing user registration...');
    const registerResult = await client.register('testuser', 'password123');
    logger.info('Register result:', registerResult);

    // Test SET command
    logger.info('Testing SET command...');
    const setResult = await client.set('test-key', 'test-value');
    logger.info('SET result:', setResult);

    // Test GET command
    logger.info('Testing GET command...');
    const getValue = await client.get('test-key');
    logger.info('GET result:', getValue);

    // Test KEYS command
    logger.info('Testing KEYS command...');
    const keys = await client.keys();
    logger.info('KEYS result:', keys);

    // Test DEL command
    logger.info('Testing DEL command...');
    const delResult = await client.del('test-key');
    logger.info('DEL result:', delResult);

    // Test with another user
    const client2 = new DatabaseClient();
    await client2.connect();
    await client2.register('testuser2', 'password456');
    
    // Set data for second user
    await client2.set('test-key', 'different-value');
    
    // Verify data isolation
    const user1Data = await client.get('test-key');
    const user2Data = await client2.get('test-key');
    
    logger.info('Data isolation test:');
    logger.info('User 1 data:', user1Data);
    logger.info('User 2 data:', user2Data);

    client2.disconnect();

  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    client.disconnect();
    logger.info('Disconnected from server');
  }
}

// Run the test
testDatabase();