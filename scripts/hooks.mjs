#!/usr/bin/env node
// Хуки Claude Code для пайплайна. Вызываются из .claude/settings.json,
// JSON события приходит на stdin. Подкоманды:
//   guard-source   PreToolUse Bash   — не даёт писать/удалять в src/features/*/source/
//   require-measure PreToolUse Edit|Write — episode.ts не правится без замера
//   lint           PostToolUse Edit|Write — линт раскладки после правки episode.ts
//   check-render   PostToolUse Bash  — приёмка после `remotion render`
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cmd = process.argv[2];

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  input = {};
}
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};

const deny = (reason) => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason},
  }));
  process.exit(0);
};
const context = (text) => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {hookEventName: 'PostToolUse', additionalContext: text},
  }));
  process.exit(0);
};
const blockWith = (text) => {
  // exit 2: stderr уходит модели как ошибка, на которую надо отреагировать
  process.stderr.write(text);
  process.exit(2);
};

const episodeRe = /src\/features\/([^/\s]+)\/episode\.ts$/;
const featureOf = (p) => episodeRe.exec(p ?? '')?.[1] ?? null;

function run(args) {
  const r = spawnSync('node', args, {cwd: ROOT, encoding: 'utf8'});
  return {code: r.status ?? 1, out: (r.stdout ?? '') + (r.stderr ?? '')};
}

switch (cmd) {
  case 'guard-source': {
    if (tool !== 'Bash') process.exit(0);
    const c = String(ti.command ?? '');
    if (!/\/source\//.test(c)) process.exit(0);
    const tokens = c.split(/\s+/);
    const isSource = (t) => /features\/[^/\s'"]+\/source\//.test(t);
    const hasWriter = tokens.some((t) => /^(rm|rmdir|mv|truncate|shred|unlink)$/.test(t));
    const sedInPlace = /\bsed\s+(-[a-zA-Z]*i|--in-place)/.test(c);
    const redirect = /(^|[^<])>+\s*\S*features\/[^/\s'"]+\/source\//.test(c);
    // ffmpeg/cp/tee: запись, если путь в source/ стоит последним аргументом
    const lastTok = tokens.filter(Boolean).at(-1) ?? '';
    const writesLast = tokens.some((t) => /^(ffmpeg|cp|tee|touch|ln)$/.test(t)) && isSource(lastTok);
    if (hasWriter || sedInPlace || redirect || writesLast) {
      deny('Оригиналы в src/features/*/source/ не трогаем: только читаем. Прокси кладутся в public/episodes/<фича>/ (./scripts/proxy.sh).');
    }
    process.exit(0);
  }

  case 'require-measure': {
    if (!['Edit', 'Write', 'MultiEdit'].includes(tool)) process.exit(0);
    const feat = featureOf(ti.file_path);
    if (!feat) process.exit(0);
    const dir = path.join(ROOT, 'src', 'features', feat);
    const frames = path.join(dir, 'measure', 'frames.jpg');
    const notes = path.join(dir, 'notes.md');
    const measured = fs.existsSync(frames)
      || (fs.existsSync(notes) && /Геометрия/i.test(fs.readFileSync(notes, 'utf8')));
    if (!measured) {
      deny(`Раскладка ${feat} без замера. Сначала ./scripts/measure.sh src/features/${feat}/source/<video> и геометрия в notes.md — крупность у автора гуляет от ролика к ролику.`);
    }
    process.exit(0);
  }

  case 'lint': {
    if (!['Edit', 'Write', 'MultiEdit'].includes(tool)) process.exit(0);
    const feat = featureOf(ti.file_path);
    if (!feat) process.exit(0);
    const r = run([path.join(ROOT, 'scripts', 'lint-episode.mjs'), feat]);
    if (r.code !== 0) blockWith(`lint-episode ${feat}:\n${r.out}`);
    if (/[⚠ℹ]/.test(r.out)) context(`lint-episode ${feat}:\n${r.out}`);
    process.exit(0);
  }

  case 'check-render': {
    if (tool !== 'Bash') process.exit(0);
    const c = String(ti.command ?? '');
    let outFile = null;
    const direct = /remotion\s+render\s+(\S+)\s+(\S+\.mp4)/.exec(c);
    if (direct) outFile = direct[2];
    const viaNpm = /npm\s+run\s+(render:[\w-]+)/.exec(c);
    if (!outFile && viaNpm) {
      const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
      const script = pkg.scripts?.[viaNpm[1]] ?? '';
      outFile = /render\s+\S+\s+(\S+\.mp4)/.exec(script)?.[1] ?? null;
    }
    if (!outFile) process.exit(0);
    const abs = path.resolve(ROOT, outFile.replace(/^['"]|['"]$/g, ''));
    if (!fs.existsSync(abs)) process.exit(0);
    // motion-выпуски без episode.ts тоже проверяются, просто без сверки с прокси
    const r = run([path.join(ROOT, 'scripts', 'check-render.mjs'), abs]);
    const text = `check-render ${path.relative(ROOT, abs)}:\n${r.out}\nПосле этого открыть контактный лист (.check.jpg) и пройти глазами: слово, лицо, субтитры, эмодзи.`;
    if (r.code !== 0) blockWith(text);
    context(text);
    process.exit(0);
  }

  default:
    process.stderr.write(`hooks.mjs: неизвестная подкоманда ${cmd}\n`);
    process.exit(1);
}
