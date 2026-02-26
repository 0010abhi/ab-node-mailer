require('dotenv').config();
const express = require('express');
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



app.listen(3000, () => console.log('Email service running'));