const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { sendEmail } = require('../services/mailer');

const connection = new Redis({
  host: 'redis',
  port: 6379,
  maxRetriesPerRequest: null
});

const worker = new Worker(
  'emailQueue',
  async job => {
    if (job.name !== 'orderPlaced') return;

    const { to, payload } = job.data;

    const subject = 'Your Order is Confirmed';
    const html = `
      <h2>Order Confirmed</h2>
      <p>Order ID: ${payload.orderId}</p>
    `;

    await sendEmail({ to, subject, html });
  },
  { connection, concurrency: 3 }
);

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed`, err);
});

console.log('Business worker started');