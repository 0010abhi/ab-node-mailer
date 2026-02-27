const { Queue } = require('bullmq');
const Redis = require('ioredis');

let connection;
let emailQueue;

try {
  connection = new Redis({
    host: 'redis',
    port: 6379,
    maxRetriesPerRequest: 3, // Required by BullMQ
    retryStrategy: (times) => {
      console.log(`Redis retry attempt #${times}`);
      return Math.min(times * 100, 2000);
    }
  });

  // Redis event listeners
  connection.on('connect', () => {
    console.log('🔌 Redis connecting...');
  });

  connection.on('ready', () => {
    console.log('✅ Redis connected and ready');
  });

  connection.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  connection.on('close', () => {
    console.warn('⚠️ Redis connection closed');
  });

  connection.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  emailQueue = new Queue('emailQueue', {
    connection
  });

  console.log('📬 Email Queue initialized');

} catch (error) {
  console.error('🚨 Failed to initialize queue:', error);
  process.exit(1); // Fail fast
}

module.exports = { emailQueue };