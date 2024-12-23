import { DatabaseClient } from '../client/client';
import { logger } from '../utils/logger';

async function testDatabase() {
  const client = new DatabaseClient();

  try {
    // Connect to the server
    await client.connect();
    logger.info('Connected successfully');

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

    // Verify deletion
    logger.info('Verifying deletion...');
    const getAfterDel = await client.get('test-key');
    logger.info('GET after DELETE:', getAfterDel);

    // Test CLEAR command
    logger.info('Testing CLEAR command...');
    await client.set('key1', 'value1');
    await client.set('key2', 'value2');
    const clearResult = await client.clear();
    logger.info('CLEAR result:', clearResult);

    // Verify clear
    const keysAfterClear = await client.keys();
    logger.info('Keys after CLEAR:', keysAfterClear);

  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    client.disconnect();
    logger.info('Disconnected from server');
  }
}

// Run the test
testDatabase();