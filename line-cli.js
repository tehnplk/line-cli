#!/usr/bin/env node
require('dotenv').config({ quiet: true });

const line = require('@line/bot-sdk');

const DEFAULT_USER_ID = 'U9c8980e7533bb6b46fb3e3c7b6d48b46';
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const channelSecret = process.env.LINE_CHANNEL_SECRET;
const to = process.env.USER_ID || DEFAULT_USER_ID;
const text = process.argv.slice(2).join(' ').trim();

if (!channelAccessToken || !channelSecret) {
  console.error('Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET in .env');
  process.exit(1);
}

if (!text) {
  console.error('Usage: line-cli "your message"');
  process.exit(1);
}

const client = new line.Client({
  channelAccessToken,
  channelSecret,
});

async function main() {
  await client.pushMessage(to, {
    type: 'text',
    text,
  });

  console.log(`Sent message to ${to}: ${text}`);
}

main().catch((error) => {
  const detail = error?.originalError?.response?.data || error.message;
  console.error('Send failed:', detail);
  process.exit(1);
});
