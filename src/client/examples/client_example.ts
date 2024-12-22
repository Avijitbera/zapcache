import { DatabaseClient } from '../database_client';
import { logger } from '../../utils/logger';
import { MemoryUserStore } from '../user_store';

async function example() {
    var userStore = new MemoryUserStore();
  const client = new DatabaseClient(
    undefined,
    userStore
  );

  try {
    // Connect to the server
    await client.connect();
    logger.info('Connected to server');

    // Register a new user
    await client.register({
      email: 'john.doe',
      password: 'password123'
    });
    logger.info('Registered successfully');

    // Store some data
    await client.set('profile', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    logger.info('Profile saved');

    // Retrieve the data
    const profile = await client.get('profile');
    logger.info('Retrieved profile:', profile);

    // List all keys
    const keys = await client.keys();
    logger.info('Available keys:', keys);

    // Create another client with different user
    const user = new MemoryUserStore();
    
    const client2 = new DatabaseClient(
        undefined, user
    );
    await client2.connect();
    await client2.register({
      email: 'jane.doe',
      password: 'password456'
    });

    // Try to access John's data (will return null as it's not accessible)
    const jane_tries = await client2.get('profile');
    logger.info("Jane trying to access John's profile:", jane_tries);

    // Store Jane's own data
    await client2.set('profile', {
      name: 'Jane Doe',
      email: 'jane@example.com',
      age: 28
    });

    // Each user can only see their own data
    const jane_profile = await client2.get('profile');
    logger.info("Jane's profile:", jane_profile);

    client2.disconnect();
  } catch (error) {
    logger.error('Error:', error);
  } finally {
    client.disconnect();
  }
}

example();