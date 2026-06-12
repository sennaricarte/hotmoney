import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = 'src/content/posts';
const START_MS = Date.UTC(2025, 8, 8);
const END_MS = Date.UTC(2026, 5, 8);

const STEP_WEIGHTS = [
  5, 8, 4, 7, 6, 3, 9, 5, 6, 4, 8, 5, 7, 4, 6, 10, 4, 5, 7, 3,
  6, 8, 5, 4, 7, 6, 9, 4, 5, 8, 3, 6, 7, 5, 4, 9, 6, 5, 7, 4, 6,
];

function parsePubDate(content) {
  const m = content.match(/^pubDate:\s*(\S+)/m);
  return m ? m[1] : null;
}

function isWeekdayUTC(ms) {
  const d = new Date(ms).getUTCDay();
  return d >= 1 && d <= 5;
}

function toWeekdayUTC(ms, dir = 1) {
  let cur = ms;
  for (let i = 0; i < 7; i++) {
    if (isWeekdayUTC(cur)) return cur;
    cur += dir * 86400000;
  }
  return ms;
}

function toIso(ms) {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatBr(ms) {
  const d = new Date(ms);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${m}/${d.getUTCFullYear()}`;
}

function avoidHolidays(ms) {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  if (y === 2025 && m === 11 && day === 25) return Date.UTC(2025, 11, 24);
  if (y === 2026 && m === 0 && day === 1) return Date.UTC(2025, 11, 31);
  return ms;
}

function generateDates(count) {
  const weights = STEP_WEIGHTS.slice(0, count - 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const span = END_MS - START_MS;
  const used = new Set();
  const dates = [];

  let cumulative = 0;
  for (let i = 0; i < count; i++) {
    let ms;
    if (i === 0) {
      ms = toWeekdayUTC(START_MS, 1);
    } else if (i === count - 1) {
      ms = toWeekdayUTC(END_MS, -1);
    } else {
      cumulative += weights[i - 1];
      const fraction = cumulative / totalWeight;
      const wobble = [0, 1, -1, 0, 2, -1, 0][i % 7];
      ms = START_MS + fraction * span + wobble * 86400000;
      ms = toWeekdayUTC(ms, 1);
      ms = avoidHolidays(ms);
    }

    let guard = 0;
    while ((used.has(toIso(ms)) || (dates.length && ms <= dates[dates.length - 1])) && guard < 20) {
      ms += 86400000;
      ms = toWeekdayUTC(ms, 1);
      ms = avoidHolidays(ms);
      guard++;
    }

    used.add(toIso(ms));
    dates.push(ms);
  }

  dates[dates.length - 1] = toWeekdayUTC(END_MS, -1);
  for (let i = dates.length - 2; i >= 0; i--) {
    if (dates[i] >= dates[i + 1]) {
      dates[i] = toWeekdayUTC(dates[i + 1] - 2 * 86400000, -1);
    }
  }

  return dates;
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
const posts = files.map((file) => {
  const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  return { file, pubDate: parsePubDate(content) };
});

posts.sort((a, b) => {
  const cmp = a.pubDate.localeCompare(b.pubDate);
  return cmp !== 0 ? cmp : a.file.localeCompare(b.file);
});

const newDates = generateDates(posts.length);

const plan = posts.map((p, i) => ({
  file: p.file,
  oldDate: p.pubDate,
  newDate: toIso(newDates[i]),
  newDateBr: formatBr(newDates[i]),
}));

const display = [...plan].sort((a, b) => a.newDate.localeCompare(b.newDate));

const gaps = display.slice(1).map((p, i) => {
  const prev = new Date(display[i].newDate + 'T12:00:00Z');
  const cur = new Date(p.newDate + 'T12:00:00Z');
  return Math.round((cur - prev) / 86400000);
});

console.log(JSON.stringify({ plan: display, stats: {
  count: plan.length,
  first: display[0].newDate,
  last: display[display.length - 1].newDate,
  avgGap: (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1),
  minGap: Math.min(...gaps),
  maxGap: Math.max(...gaps),
  gaps,
}}, null, 2));
