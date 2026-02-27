require('dotenv').config();
const express = require('express');
const os = require('os');

const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const { emailQueue } = require('./queue/emailQueue');

const app = express();
app.use(express.json());

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.post('/send-email', async (req, res) => {
  const { type, payload, to } = req.body;

  await emailQueue.add(type, { type, payload, to }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });

  res.json({ status: 'queued' });
});

/**
 * Logs system configuration after a delay if in development mode.
 * @param {number} delayMs - Delay in milliseconds (configurable)
 */
function logSystemInfo(delayMs = 2000) {
  // Check if NODE_ENV is set to 'development'
  // Note: Node.js often defaults to 'development' if not specified
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  if (isDev) {
    setTimeout(() => {
      const config = {
        "Platform": os.platform(),
        "Architecture": os.arch(),
        "CPUs": os.cpus().length,
        "Total Memory": (os.totalmem() / 1024**3).toFixed(2) + " GB",
        "Free Memory": (os.freemem() / 1024**3).toFixed(2) + " GB",
        "Hostname": os.hostname(),
        "System Uptime": (os.uptime() / 3600).toFixed(2) + " hours"
      };

      console.log("--- Dev Mode: Machine Configuration ---");
      console.table(config); // console.table provides a clean, readable layout
      console.log("----------------------------------------");
    }, delayMs);
  }
}

// Usage: Pass the desired delay in ms
const LOG_DELAY = process.env.LOG_DELAY || 5000; 
logSystemInfo(Number(LOG_DELAY));



app.listen(5000, () => console.log('Email service running on port 5000'));