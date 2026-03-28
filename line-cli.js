#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');
const line = require('@line/bot-sdk');

const envCandidates = [
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true });
    break;
  }
}

const DEFAULT_USER_ID = 'U9c8980e7533bb6b46fb3e3c7b6d48b46';
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
const to = process.env.USER_ID || DEFAULT_USER_ID;
const args = process.argv.slice(2);
const SKILL_FILE_NAME = 'SKILL.MD';

function printUsage() {
  console.log(
    [
      'Usage:',
      '  line-cli --send "your message"',
      '  line-cli --help',
      '  line-cli --skill [question]',
      '',
      'Options:',
      '  --help, -h   Show usage',
      '  --send       Send LINE text message to USER_ID',
      `  --skill      Create/read ${SKILL_FILE_NAME} and answer from it`,
    ].join('\n'),
  );
}

function getSkillTemplate() {
  return [
    '---',
    'name: line-cli-skill',
    'description: Guidance for answering users with line-cli behavior and style.',
    '---',
    '',
    '# Line CLI Skill',
    '',
    '## Purpose',
    '- Provide concise and friendly answers for LINE message operations.',
    '',
    '## Core Rules',
    '- Keep responses short and clear.',
    '- Confirm the exact message text before sending if ambiguous.',
    '- Respect the default target USER_ID unless user requests another one.',
    '',
    '## Answer Style',
    '- Use practical command examples.',
    '- Mention errors with direct fixes.',
    '',
    '## Examples',
    '- Send message: `line-cli --send "Hello from line-cli"`',
    '- Show help: `line-cli --help`',
  ].join('\n');
}

function ensureSkillFile() {
  const skillFilePath = path.resolve(process.cwd(), SKILL_FILE_NAME);
  if (!fs.existsSync(skillFilePath)) {
    fs.writeFileSync(skillFilePath, getSkillTemplate(), 'utf8');
    console.log(`Created ${SKILL_FILE_NAME} at ${skillFilePath}`);
  }
  return skillFilePath;
}

function answerFromMarkdown(content, question) {
  if (!question) {
    return content;
  }

  const sections = content.split(/\n(?=##\s+)/g);
  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let bestSection = '';
  let bestScore = -1;

  for (const section of sections) {
    const lower = section.toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  if (bestScore <= 0) {
    return [
      'No matching section found in SKILL.MD.',
      '',
      'Tip: ask with keywords from the document headings/content.',
    ].join('\n');
  }

  return bestSection.trim();
}

async function sendLineMessage(text) {
  if (!channelAccessToken || !channelSecret) {
    console.error('Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_CHANNEL_SECRET in environment or .env');
    process.exit(1);
  }

  const client = new line.Client({
    channelAccessToken,
    channelSecret,
  });

  await client.pushMessage(to, {
    type: 'text',
    text,
  });

  console.log(`Sent message to ${to}: ${text}`);
}

async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  if (args.includes('--skill')) {
    const skillFilePath = ensureSkillFile();
    const markdown = fs.readFileSync(skillFilePath, 'utf8');
    const query = args.filter((arg) => arg !== '--skill').join(' ').trim();
    const answer = answerFromMarkdown(markdown, query);
    console.log(answer);
    return;
  }

  const sendIndex = args.indexOf('--send');
  if (sendIndex === -1) {
    console.error('Missing required option: --send');
    printUsage();
    process.exit(1);
  }

  const text = args.slice(sendIndex + 1).join(' ').trim();
  if (!text) {
    console.error('Missing message text for --send');
    printUsage();
    process.exit(1);
  }

  await sendLineMessage(text);
}

main().catch((error) => {
  const detail = error?.originalError?.response?.data || error.message;
  console.error('Send failed:', detail);
  process.exit(1);
});
