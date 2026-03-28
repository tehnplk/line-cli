require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

function validateLineSignature(req) {
  if (!CHANNEL_SECRET) return false;

  const signature = req.get('x-line-signature');
  if (!signature || !req.rawBody) return false;

  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(req.rawBody)
    .digest('base64');

  return hash === signature;
}

async function callLineApi(path, payload) {
  if (!CHANNEL_ACCESS_TOKEN) {
    throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN in .env');
  }

  const response = await axios.post(
    `https://api.line.me/v2/bot/message/${path}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  return response.data;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/webhook', async (req, res) => {
  try {
    if (!validateLineSignature(req)) {
      return res.status(401).json({ error: 'Invalid LINE signature' });
    }

    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text' && event.replyToken) {
        await callLineApi('reply', {
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: `คุณพิมพ์ว่า: ${event.message.text}` }],
        });
      }
    }

    return res.status(200).json({ success: true, received: events.length });
  } catch (error) {
    const detail = error.response?.data || error.message;
    return res.status(500).json({ error: 'Webhook failed', detail });
  }
});

app.post('/push-message', async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ error: 'Required fields: to, text' });
    }

    await callLineApi('push', {
      to,
      messages: [{ type: 'text', text }],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    const detail = error.response?.data || error.message;
    return res.status(500).json({ error: 'Push message failed', detail });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
