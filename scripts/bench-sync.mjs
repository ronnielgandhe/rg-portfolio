import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/bench');
const TODAY = new Date().toISOString().slice(0, 10);
const UA = { 'user-agent': 'bench-sync (public leaderboard mirror)' };

async function get(url, as = 'text') {
  const res = await fetch(url, { headers: UA, redirect: 'follow' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  if (as === 'json') return res.json();
  if (as === 'buf') return Buffer.from(await res.arrayBuffer());
  return res.text();
}

async function lastCommit(repo, path, branch) {
  try {
    const q = new URLSearchParams({ path, per_page: '1', ...(branch ? { sha: branch } : {}) });
    const j = await get(`https://api.github.com/repos/${repo}/commits?${q}`, 'json');
    return j[0]?.commit?.committer?.date?.slice(0, 10) ?? null;
  } catch { return null; }
}

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1 || r[0]);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

function unzip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let n = 0; n < count; n++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + size);
    if (!name.endsWith('/')) files[name] = (method === 8 ? inflateRawSync(raw) : raw).toString('utf8');
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const num = (v) => {
  if (v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(/[%,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const maxDate = (arr) => arr.filter(Boolean).map((d) => String(d).slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop() ?? null;


const PROVIDERS = {
  anthropic: 'Anthropic', openai: 'OpenAI', google: 'Google', 'x-ai': 'xAI', deepseek: 'DeepSeek', 'meta-llama': 'Meta', meta: 'Meta',
  mistralai: 'Mistral', qwen: 'Qwen', moonshotai: 'Moonshot', 'z-ai': 'Z.ai', minimax: 'MiniMax', amazon: 'Amazon', cohere: 'Cohere',
  microsoft: 'Microsoft', nvidia: 'NVIDIA', xiaomi: 'Xiaomi', tencent: 'Tencent', perplexity: 'Perplexity', baidu: 'Baidu',
  'bytedance-seed': 'ByteDance', bytedance: 'ByteDance', thinkingmachines: 'Thinking Machines', stepfun: 'StepFun', 'ibm-granite': 'IBM',
  writer: 'Writer', upstage: 'Upstage', reflection: 'Reflection', inclusionai: 'inclusionAI', liquid: 'Liquid', sakana: 'Sakana',
  'nex-agi': 'Nex AGI', 'aion-labs': 'Aion Labs', rekaai: 'Reka', nousresearch: 'Nous', 'motif-technologies': 'Motif',
};

const ALIASES = {
  'moonshotai-kimi-k2-instruct': 'moonshotai/kimi-k2',
  'qwen3-235b-a22b-instruct-2507': 'qwen/qwen3-235b-a22b-2507',
  'llama-4-maverick-17b-128e-instruct-fp8': 'meta-llama/llama-4-maverick',
  'llama-4-scout-17b-16e-instruct': 'meta-llama/llama-4-scout',
  'amazon-nova-2-lite-v1': 'amazon/nova-2-lite-v1',
  'amazon-nova-pro-v1': 'amazon/nova-pro-v1',
  'amazon-nova-micro-v1': 'amazon/nova-micro-v1',
  'amazon-nova-lite-v1': 'amazon/nova-lite-v1',
  'mistral-medium-2505': 'mistralai/mistral-medium-3',
  'mistral-small-2506': 'mistralai/mistral-small-3.2-24b-instruct',
  'open-mistral-nemo-2407': 'mistralai/mistral-nemo',
  'deepseek-v3-0324': 'deepseek/deepseek-chat-v3-0324',
  'deepseek-r1-0528': 'deepseek/deepseek-r1-0528',
  'gemini-3-1-pro': 'google/gemini-3.1-pro-preview',
  'gemini-3-flash': 'google/gemini-3-flash-preview',
  'command-a-03-2025': 'cohere/command-a',
  'command-r7b': 'cohere/command-r7b-12-2024',
  'gemma-4-31b': 'google/gemma-4-31b-it',
  'kimi-k2-instruct': 'moonshotai/kimi-k2',
  'kimi-k2-instruct-0905': 'moonshotai/kimi-k2-0905',
  'qwen3-coder-480b-a35b-instruct': 'qwen/qwen3-coder',
  'mistral-3-large-2512': 'mistralai/mistral-large-2512',
  'mistral-medium-2508': 'mistralai/mistral-medium-3.1',
  'mistral-small-3-2-2506': 'mistralai/mistral-small-3.2-24b-instruct',
  'mistral-small-3-1-2503': 'mistralai/mistral-small-3.1-24b-instruct',
  'mistral-small-3-2501': 'mistralai/mistral-small-24b-instruct-2501',
  'mistral-small-2501': 'mistralai/mistral-small-24b-instruct-2501',
  'kimi-k2-snap-jul-2025': 'moonshotai/kimi-k2',
  'gemini-2-5-pro-snap-jun-2025': 'google/gemini-2.5-pro',
  'deepseek-v3-snap-mar-2025': 'deepseek/deepseek-chat-v3-0324',
  'gpt-4o-snap-nov-2024': 'openai/gpt-4o-2024-11-20',
};

const HIDDEN_ORGS = /(^|\.)zoom\.(ai|us|com)$/i;
const EFFORT = /_(unknown|minimal|none|low|medium|high|xhigh|max|thinking|\d+k)$/i;
const MONTH_YEAR = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? \d{4}$/i;
const INNER_EFFORT = /-(minimal|low|medium|high|xhigh)(-20\d{2}-\d{2}-\d{2})$/;
function norm(raw) {
  let s = String(raw).toLowerCase().trim();
  s = s.replace(/^[a-z0-9_.-]+\//, '');
  s = s.replace(/:\d+$/, '');
  s = s.replace(/\(([^)]*)\)/g, (_, inner) => {
    const t = inner.trim();
    if (/^(\d{4}|\d{4}-\d{2}-\d{2})$/.test(t)) return `-${t}`;
    if (MONTH_YEAR.test(t)) return `-snap-${t}`;
    return ' ';
  });
  s = s.replace(EFFORT, '').replace(INNER_EFFORT, '$2');
  s = s.replace(/([a-z]\d+)p(\d)\b/, '$1-$2');
  s = s.replace(/[\s_.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  s = s.replace(/^claude-(\d+(?:-\d+)?)-(opus|sonnet|haiku|fable)\b/, 'claude-$2-$1');
  s = s.replace(/^qwen-(\d)/, 'qwen$1');
  return s;
}
const stripDate = (k) => k.replace(/-(20\d{2}-\d{2}-\d{2}|20\d{6})$/, '');
const variantOf = (raw) => {
  const p = String(raw).match(/\(([^)]*)\)/)?.[1];
  const e = String(raw).match(EFFORT)?.[1] ?? String(raw).match(INNER_EFFORT)?.[1];
  if (e && /^\d+k$/i.test(e)) return `${e.toUpperCase()} thinking`;
  return (p && !/^\d{4}/.test(p) && !MONTH_YEAR.test(p.trim()) ? p : null) ?? (e && e !== 'unknown' ? e : null);
};

function buildIndex(models) {
  const map = new Map();
  const nameHits = new Map();
  for (const m of models) map.set(norm(m.id), m.id);
  for (const m of models) {
    if (/\((?!\d{4}(-\d{2}-\d{2})?\))/.test(m.name)) continue;
    const k = norm(m.name);
    if (!map.has(k)) nameHits.set(k, [...(nameHits.get(k) ?? []), m.id]);
  }
  for (const [k, ids] of nameHits) if (ids.length === 1) map.set(k, ids[0]);
  const byId = new Set(models.map((m) => m.id));
  return (raw) => {
    if (/\s\+\s|\bensemble\b/i.test(raw)) return null;
    const k = norm(raw);
    if (ALIASES[k] && byId.has(ALIASES[k])) return ALIASES[k];
    if (map.has(k)) return map.get(k);
    const d = stripDate(k);
    if (d !== k && ALIASES[d] && byId.has(ALIASES[d])) return ALIASES[d];
    if (d !== k && map.has(d)) return map.get(d);
    return null;
  };
}

function finalize(bench, rows, match) {
  const better = (a, b) => (bench.higherIsBetter ? a > b : a < b);
  const best = new Map();
  let unmatched = 0;
  for (const r of rows) {
    if (r.score === null || r.score === undefined || !String(r.raw ?? '').trim()) continue;
    const modelId = match ? match(r.raw) : null;
    if (match && !modelId) unmatched++;
    const key = modelId ?? (match ? `raw:${norm(r.raw)}` : `raw:${r.raw}`);
    const prev = best.get(key);
    const row = { modelId, raw: r.raw, name: r.name ?? null, org: r.org ?? null, score: r.score, variant: r.variant ?? variantOf(r.raw), extra: r.extra ?? undefined, src: bench.source };
    if (!prev) best.set(key, { ...row, runs: 1 });
    else { prev.runs++; if (better(row.score, prev.score)) best.set(key, { ...row, runs: prev.runs }); }
  }
  const out = [...best.values()].sort((a, b) => (bench.higherIsBetter ? b.score - a.score : a.score - b.score));
  out.forEach((r, i) => { r.rank = i + 1; });
  const total = rows.filter((r) => r.score !== null && r.score !== undefined && String(r.raw ?? '').trim()).length;
  bench.stats = match
    ? { rawRows: total, matchedRows: total - unmatched, unmatchedRows: unmatched, matchRate: total ? +((total - unmatched) / total).toFixed(3) : 0, models: out.length, pricedModels: out.filter((r) => r.modelId).length }
    : { rawRows: total, models: out.length, matchRate: null };
  bench.rows = out;
  return bench;
}


const SOURCES = {
  openrouter: { name: 'OpenRouter models API', url: 'https://openrouter.ai/api/v1/models', home: 'https://openrouter.ai/models', license: 'public API, no license stated; used for list prices and context only', role: 'prices, context windows, model list' },
  aa: { name: 'Artificial Analysis (via OpenRouter)', url: 'https://openrouter.ai/api/v1/models', home: 'https://artificialanalysis.ai', license: 'Artificial Analysis asks for attribution; values read from the benchmarks field OpenRouter publishes', role: 'intelligence index' },
  epoch: { name: 'Epoch AI benchmarking hub', url: 'https://epoch.ai/data/benchmark_data.zip', home: 'https://epoch.ai/benchmarks', license: 'CC BY 4.0', role: 'ECI, SWE-bench Verified, Terminal-Bench, GPQA, HLE, SimpleQA' },
  livebench: { name: 'LiveBench', url: 'https://livebench.ai/data/<release>/table.csv', home: 'https://livebench.ai', license: 'Apache-2.0 (repo license, inherited from FastChat)', role: 'LiveBench 2.0' },
  aider: { name: 'Aider polyglot leaderboard', url: 'https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml', home: 'https://aider.chat/docs/leaderboards/', license: 'Apache-2.0', role: 'Aider polyglot' },
  bfcl: { name: 'Berkeley Function Calling Leaderboard', url: 'https://gorilla.cs.berkeley.edu/data_overall.csv', home: 'https://gorilla.cs.berkeley.edu/leaderboard.html', license: 'Apache-2.0 (gorilla repo)', role: 'BFCL v4' },
  vectara: { name: 'Vectara hallucination leaderboard', url: 'https://raw.githubusercontent.com/vectara/hallucination-leaderboard/main/README.md', home: 'https://github.com/vectara/hallucination-leaderboard', license: 'Apache-2.0', role: 'hallucination rate' },
  openasr: { name: 'Hugging Face Open ASR leaderboard', url: 'https://hf-audio-open-asr-leaderboard.hf.space/config', home: 'https://huggingface.co/spaces/hf-audio/open_asr_leaderboard', license: 'eval code Apache-2.0 (huggingface/open_asr_leaderboard); space has no data license tag', role: 'speech to text' },
  ttsarena: { name: 'TTS Arena V2', url: 'https://tts-agi-tts-arena-v2.hf.space/api/leaderboard', home: 'https://huggingface.co/spaces/TTS-AGI/TTS-Arena-V2', license: 'Apache-2.0 (TTS-AGI/TTS-Arena)', role: 'text to speech' },
};

async function loadOpenRouter() {
  const j = await get(SOURCES.openrouter.url, 'json');
  const models = [];
  const aa = [];
  for (const m of j.data) {
    if (m.id.includes(':') || m.id.startsWith('~') || m.id.startsWith('openrouter/')) continue;
    if (!m.architecture?.output_modalities?.includes('text')) continue;
    const pin = num(m.pricing?.prompt);
    const pout = num(m.pricing?.completion);
    if (pin === null || pout === null || pin < 0 || pout < 0) continue;
    const slug = m.id.split('/')[0];
    models.push({
      id: m.id,
      name: m.name.includes(': ') ? m.name.split(': ').slice(1).join(': ') : m.name,
      provider: PROVIDERS[slug] ?? (m.name.includes(': ') ? m.name.split(': ')[0] : slug),
      inPrice: +(pin * 1e6).toFixed(4),
      outPrice: +(pout * 1e6).toFixed(4),
      context: m.context_length ?? null,
      added: m.created ? new Date(m.created * 1000).toISOString().slice(0, 10) : null,
      released: null,
      open: !!m.hugging_face_id,
      modality: m.architecture?.modality ?? null,
    });
    const ai = m.benchmarks?.artificial_analysis?.intelligence_index;
    if (typeof ai === 'number') aa.push({ raw: m.id, score: ai });
  }
  return { models, aa };
}

async function loadEpoch() {
  const files = unzip(await get(SOURCES.epoch.url, 'buf'));
  const csv = (f) => parseCSV(files[f] ?? '');
  const pct = (rows, col, dateCols = ['Started at', 'Release date']) => ({
    rows: rows.map((r) => ({ raw: r['Model version'], score: num(r[col]) === null ? null : +(num(r[col]) * 100).toFixed(1), released: r['Release date'] })),
    date: maxDate(rows.flatMap((r) => dateCols.map((c) => r[c]))),
  });
  const eciRows = csv('epoch_capabilities_index/eci_scores.csv');
  const tb = csv('terminalbench_external.csv').filter((r) => /terminal-bench\/2\.0|Terminal-Bench v2/i.test(r.Source));
  const released = {};
  for (const r of csv('model_metadata.csv')) if (r.model_version && r.date) released[norm(r.model_version)] = r.date;
  for (const r of eciRows) if (r.date) released[norm(r.Model)] = r.date;
  return {
    released,
    eci: { rows: eciRows.map((r) => ({ raw: r.Model, score: num(r.eci) })), date: maxDate(eciRows.map((r) => r.date)) },
    swe: pct(csv('swe_bench_verified.csv'), 'Best score (across scorers)'),
    gpqa: pct(csv('gpqa_diamond.csv'), 'Best score (across scorers)'),
    simpleqa: pct(csv('simpleqa_verified.csv'), 'Best score (across scorers)'),
    hle: pct(csv('hle_external.csv'), 'Accuracy', ['Release date']),
    tb: {
      rows: tb.map((r) => ({ raw: r['Model version'], score: num(r['Accuracy mean']) === null ? null : +(num(r['Accuracy mean']) * 100).toFixed(1), variant: r.Agent || null, extra: { agent: r.Agent || null } })),
      date: maxDate(tb.map((r) => r['Run date'])),
    },
  };
}

async function loadLiveBench() {
  const html = await get('https://livebench.ai/');
  const js = html.match(/src="\.?\/?(static\/js\/main\.[a-z0-9]+\.js)"/)?.[1];
  let release = null;
  if (js) {
    const bundle = await get(`https://livebench.ai/${js}`);
    const lists = [...bundle.matchAll(/\[("\d{8}"(?:,"\d{8}")*)\]/g)].flatMap((m) => m[1].replace(/"/g, '').split(','));
    release = lists.sort().pop() ?? null;
  }
  if (!release) throw new Error('livebench release id not found');
  const base = `https://livebench.ai/data/${release}`;
  const table = parseCSV(await get(`${base}/table.csv`));
  const cats = await get(`${base}/categories.json`, 'json');
  const weights = cats._overall_weights ?? {};
  const groups = Object.entries(cats).filter(([k]) => !k.startsWith('_'));
  const rows = table.map((r) => {
    let sum = 0; let w = 0; let missing = false;
    const parts = {};
    for (const [label, cols] of groups) {
      const vals = cols.map((c) => num(r[c])).filter((v) => v !== null);
      if (!vals.length) { missing = true; continue; }
      const v = vals.reduce((a, b) => a + b, 0) / vals.length;
      parts[label.toLowerCase()] = +v.toFixed(1);
      const wt = weights[label] ?? 1;
      sum += v * wt; w += wt;
    }
    return { raw: r.model, score: missing ? null : +(sum / w).toFixed(1), extra: parts };
  });
  const date = `${release.slice(0, 4)}-${release.slice(4, 6)}-${release.slice(6, 8)}`;
  return { rows, date, url: `${base}/table.csv`, weights };
}

async function loadAider() {
  const text = await get(SOURCES.aider.url);
  const entries = [];
  let cur = null;
  for (const line of text.split('\n')) {
    const m = line.match(/^(-\s+|\s{2})([a-z_0-9]+):\s*(.*)$/);
    if (!m) continue;
    if (m[1].startsWith('-')) { cur = {}; entries.push(cur); }
    if (cur) cur[m[2]] = m[3].replace(/^['"]|['"]$/g, '');
  }
  return {
    rows: entries.map((e) => ({ raw: e.model, score: num(e.pass_rate_2), variant: variantOf(e.model), extra: { cost: num(e.total_cost), format: e.edit_format || null } })),
    date: maxDate(entries.map((e) => e.date)),
    commit: await lastCommit('Aider-AI/aider', 'aider/website/_data/polyglot_leaderboard.yml'),
  };
}

async function loadBFCL() {
  const rows = parseCSV(await get(SOURCES.bfcl.url));
  return {
    rows: rows.map((r) => ({ raw: r.Model, org: r.Organization || null, score: num(r['Overall Acc']), variant: variantOf(r.Model) })),
    date: await lastCommit('ShishirPatil/gorilla', 'data_overall.csv', 'gh-pages'),
  };
}

async function loadVectara() {
  const md = await get(SOURCES.vectara.url);
  const rows = [];
  for (const line of md.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 5 || !cells[2]?.endsWith('%') || cells[1] === 'Model') continue;
    rows.push({ raw: cells[1], score: num(cells[2]), extra: { answerRate: num(cells[4]) } });
  }
  const upd = md.match(/Last updated on ([A-Za-z]+ \d{1,2}, \d{4})/)?.[1];
  const date = upd ? new Date(`${upd} UTC`).toISOString().slice(0, 10) : null;
  return { rows, date };
}

async function loadOpenASR() {
  const cfg = await get(SOURCES.openasr.url, 'json');
  const df = cfg.components.find((c) => c.type === 'dataframe' && c.props?.value?.headers?.some((h) => h.startsWith('Average WER')) && c.props.value.headers.some((h) => h.startsWith('RTFx')) && c.props.value.headers.includes('AMI-Cleaned'));
  if (!df) throw new Error('open asr table not found');
  const h = df.props.value.headers;
  const iw = h.findIndex((x) => x.startsWith('Average WER'));
  const ir = h.findIndex((x) => x.startsWith('RTFx'));
  const im = h.indexOf('model');
  const rows = df.props.value.data.map((r) => {
    const cell = String(r[im]);
    const url = cell.match(/href="([^"]+)"/)?.[1] ?? null;
    const name = cell.replace(/<[^>]+>/g, '').replace(/\u{1F917}/gu, '').replace(/NEW$/, '').trim();
    const org = name.includes('/') ? name.split('/')[0] : (url ? new URL(url).hostname.replace(/^www\./, '') : null);
    return { raw: name, name, org, score: num(r[iw]), extra: { rtfx: num(r[ir]), url, open: !!url?.includes('huggingface.co/') } };
 }).filter((r) => !HIDDEN_ORGS.test(r.extra.url ? new URL(r.extra.url).hostname.replace(/^www\./, '') : ''));
  const versions = cfg.components.flatMap((c) => c.props?.choices ?? []).flat().map(String).filter((v) => /^\d{2}-\d{2}-\d{4}$/.test(v));
  const latest = versions.map((v) => v.split('-').reverse().join('-')).sort().pop() ?? null;
  return { rows, date: latest };
}

async function loadTTSArena() {
  const j = await get(SOURCES.ttsarena.url, 'json');
  const rows = j.rows.filter((r) => r.active !== false && !r.suspended).map((r) => ({
    raw: r.name, name: r.name, org: r.url ? new URL(r.url).hostname.replace(/^www\./, '') : null, score: r.elo,
    extra: { votes: r.totalVotes, ci: r.uncertainty, open: !!r.open, preliminary: !!r.preliminary },
  }));
  return { rows, date: TODAY };
}


const CATALOGUE = [
  { id: 'eci', name: 'Epoch Capabilities Index', short: 'ECI', category: 'general', source: 'epoch', measures: 'one number that stitches dozens of benchmarks onto a single capability scale.', metric: 'ECI score', unit: '', higherIsBetter: true, url: 'https://epoch.ai/benchmarks/eci' },
  { id: 'aa_index', name: 'Artificial Analysis Intelligence Index', short: 'AA index', category: 'general', source: 'aa', measures: 'a blended score over a fixed set of reasoning, knowledge, math and coding evals.', metric: 'index', unit: '', higherIsBetter: true, url: 'https://artificialanalysis.ai/methodology/intelligence-benchmarking' },
  { id: 'livebench', name: 'LiveBench 2.0', short: 'LiveBench', category: 'general', source: 'livebench', measures: 'long, contamination-free tasks where the model hands back real work (agent runs, code, research, design) and gets graded.', metric: 'weighted average of the published category scores, using livebench\'s own weights', unit: '%', higherIsBetter: true, url: 'https://livebench.ai' },
  { id: 'swe_verified', name: 'SWE-bench Verified', short: 'SWE-bench', category: 'coding', source: 'epoch', measures: 'can the model fix a real github issue so the repo\'s own tests pass. run by epoch with one fixed harness.', metric: 'issues resolved', unit: '%', higherIsBetter: true, url: 'https://epoch.ai/benchmarks/swe-bench-verified' },
  { id: 'aider', name: 'Aider polyglot', short: 'Aider', category: 'coding', source: 'aider', measures: '225 hard exercism exercises in six languages, edited through aider. solved within two tries.', metric: 'pass rate, 2 tries', unit: '%', higherIsBetter: true, url: 'https://aider.chat/docs/leaderboards/' },
  { id: 'terminal_bench', name: 'Terminal-Bench 2.0', short: 'Terminal-Bench', category: 'agentic', source: 'epoch', measures: 'real jobs done end to end in a terminal: build, debug, configure, ship. best reported agent harness per model.', metric: 'tasks completed', unit: '%', higherIsBetter: true, url: 'https://www.tbench.ai/leaderboard/terminal-bench/2.0' },
  { id: 'bfcl', name: 'Berkeley Function Calling Leaderboard v4', short: 'BFCL', category: 'tools', source: 'bfcl', measures: 'does the model call the right function with the right arguments: single, parallel, multi-turn, memory and web search.', metric: 'overall accuracy, best of native and prompted mode', unit: '%', higherIsBetter: true, url: 'https://gorilla.cs.berkeley.edu/leaderboard.html' },
  { id: 'vectara', name: 'Vectara hallucination leaderboard', short: 'Vectara', category: 'hallucination', source: 'vectara', measures: 'how often the model adds things that are not in the document when asked to summarize it.', metric: 'hallucination rate', unit: '%', higherIsBetter: false, url: 'https://github.com/vectara/hallucination-leaderboard' },
  { id: 'simpleqa', name: 'SimpleQA Verified', short: 'SimpleQA', category: 'hallucination', source: 'epoch', measures: 'short fact questions with one right answer. does the model know it or make it up.', metric: 'correct', unit: '%', higherIsBetter: true, url: 'https://epoch.ai/benchmarks/simpleqa-verified' },
  { id: 'gpqa', name: 'GPQA Diamond', short: 'GPQA', category: 'reasoning', source: 'epoch', measures: 'grad-school science questions written so you cannot just google them.', metric: 'correct', unit: '%', higherIsBetter: true, url: 'https://epoch.ai/benchmarks/gpqa-diamond' },
  { id: 'hle', name: "Humanity's Last Exam", short: 'HLE', category: 'reasoning', source: 'epoch', measures: 'expert-written questions at the edge of what people know, across every field.', metric: 'correct', unit: '%', higherIsBetter: true, url: 'https://lastexam.ai' },
  { id: 'asr_en', name: 'Open ASR leaderboard, english', short: 'Open ASR', category: 'speech', source: 'openasr', measures: 'word error rate on english audio: meetings, earnings calls, podcasts, noisy and conversational speech.', metric: 'average word error rate', unit: '%', higherIsBetter: false, url: 'https://huggingface.co/spaces/hf-audio/open_asr_leaderboard' },
  { id: 'tts_arena', name: 'TTS Arena V2', short: 'TTS Arena', category: 'speech', source: 'ttsarena', measures: 'people hear two voices read the same line and pick the better one. elo from the votes.', metric: 'elo', unit: '', higherIsBetter: true, url: 'https://huggingface.co/spaces/TTS-AGI/TTS-Arena-V2' },
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const log = [];
  const failed = {};
  const tryLoad = async (key, fn) => {
    try { return await fn(); } catch (e) { failed[key] = String(e.message ?? e); console.error(`x ${key}: ${failed[key]}`); return null; }
  };

  const or = await loadOpenRouter();
  const match = buildIndex(or.models);
  const [epoch, lb, aider, bfcl, vect, asr, tts] = await Promise.all([
    tryLoad('epoch', loadEpoch), tryLoad('livebench', loadLiveBench), tryLoad('aider', loadAider), tryLoad('bfcl', loadBFCL),
    tryLoad('vectara', loadVectara), tryLoad('openasr', loadOpenASR), tryLoad('ttsarena', loadTTSArena),
  ]);

  if (epoch) for (const m of or.models) m.released = epoch.released[norm(m.id)] ?? epoch.released[norm(m.name)] ?? null;

  const input = {
    eci: epoch?.eci, aa_index: { rows: or.aa, date: TODAY }, livebench: lb, swe_verified: epoch?.swe, aider, terminal_bench: epoch?.tb,
    bfcl, vectara: vect, simpleqa: epoch?.simpleqa, gpqa: epoch?.gpqa, hle: epoch?.hle, asr_en: asr, tts_arena: tts,
  };

  for (const f of readdirSync(OUT)) if (f.endsWith('.json')) unlinkSync(join(OUT, f));

  const benches = [];
  for (const def of CATALOGUE) {
    const data = input[def.id];
    if (!data) continue;
    const speech = def.category === 'speech';
    const b = finalize({ ...def, date: data.date ?? null, dataUrl: data.url ?? SOURCES[def.source].url, license: SOURCES[def.source].license, extraNote: def.id === 'livebench' ? { weights: data.weights } : undefined }, data.rows, speech ? null : match);
    writeFileSync(join(OUT, `${def.id}.json`), JSON.stringify(b));
    benches.push(b);
    const s = b.stats;
    log.push(`${def.id.padEnd(15)} rows=${String(s.rawRows).padStart(4)} models=${String(s.models).padStart(4)} ${s.matchRate === null ? 'match=n/a (speech, own names)' : `match=${(s.matchRate * 100).toFixed(0)}% (${s.unmatchedRows} unmatched)`} date=${b.date}`);
  }

  const scored = new Set(benches.flatMap((b) => b.rows.map((r) => r.modelId).filter(Boolean)));
  writeFileSync(join(OUT, 'models.json'), JSON.stringify({ syncedAt: TODAY, pricing: { source: 'openrouter', date: TODAY, note: 'list price per 1M tokens on openrouter, base variant; cache and batch discounts ignored' }, models: or.models.map((m) => ({ ...m, scored: scored.has(m.id) })) }));
  writeFileSync(join(OUT, 'sources.json'), JSON.stringify({
    syncedAt: TODAY,
    sources: Object.entries(SOURCES).map(([id, s]) => ({ id, ...s, ok: !failed[id], error: failed[id] ?? null, benchmarks: benches.filter((b) => b.source === id).map((b) => b.id) })),
    benchmarks: benches.map(({ rows, ...b }) => b),
  }));

  console.log(`synced ${TODAY}: ${or.models.length} priced models, ${scored.size} with at least one score`);
  for (const l of log) console.log('  ' + l);
  if (Object.keys(failed).length) console.log('failed:', failed);
}

main().catch((e) => { console.error(e); process.exit(1); });
