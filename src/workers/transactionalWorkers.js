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
    if (job.name !== 'resetPassword' && job.name !== 'verifyAccount') {
      return;
    }

    const { to, payload } = job.data;

    let subject;
    let html;

    if (job.name === 'resetPassword') {
      subject = 'Reset Your Password';
      html = `<p>Click here to reset: ${payload.link}</p>`;
    }

    if (job.name === 'verifyAccount') {
      subject = 'Verify Your Account';
      html = `<p>Verify here: ${payload.link}</p>`;
    }

    await sendEmail({ to, subject, html });
  },
  { connection, concurrency: 5 }
);

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed`, err);
});


console.log('Transactional worker started');