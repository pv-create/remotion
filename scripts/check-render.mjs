#!/usr/bin/env node
// Приёмка рендера: машинная часть чек-листа из CLAUDE.md плюс контактный лист
// стилов на каждом оверлее — по нему глазами сверяются слово, лицо и эмодзи.
//   node scripts/check-render.mjs out/devops.mp4 [фича]
// Фича по умолчанию — имя файла без расширения. Лист ложится рядом:
// out/devops.check.jpg. Код выхода 1, если что-то не прошло.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {FPS, HEIGHT, PUBLIC, WIDTH, featureFromArg, loadEpisode, probeVideo, rel} from './lib/episode.mjs';

const out = process.argv[2];
if (!out || !fs.existsSync(out)) {
  console.error('укажи рендер: node scripts/check-render.mjs out/devops.mp4 [фича]');
  process.exit(2);
}
const featName = process.argv[3] ?? path.basename(out).replace(/\.mp4$/, '');
const feat = featureFromArg(featName);

const fails = [];
const warns = [];
const oks = [];
const F = (m) => fails.push(m);
const W = (m) => warns.push(m);
const OK = (m) => oks.push(m);

// mute — окна [from, to] в секундах, которые глушатся перед замером. Нужно,
// чтобы сверять рендер с прокси без SFX: одинаково вырезаем их из обоих.
function volume(file, mute = []) {
  const gate = mute.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
  const af = (gate ? `volume=0:enable='${gate}',` : '') + 'volumedetect';
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-i', file, '-vn', '-af', af, '-f', 'null', '-'], {encoding: 'utf8'});
  const s = r.stderr ?? '';
  const mean = Number(/mean_volume:\s*(-?[\d.]+)/.exec(s)?.[1]);
  const max = Number(/max_volume:\s*(-?[\d.]+)/.exec(s)?.[1]);
  return {mean, max};
}

function lastFrameLuma(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-sseof', '-0.2', '-i', file, '-vf', 'signalstats,metadata=print:file=-', '-f', 'null', '-'], {encoding: 'utf8'});
  const m = [...(r.stdout ?? '').matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)];
  return m.length ? Number(m[m.length - 1][1]) : NaN;
}

// --- 1. контейнер ---------------------------------------------------------------
const v = probeVideo(out);
if (v.width === WIDTH && v.height === HEIGHT) OK(`${v.width}×${v.height}`);
else F(`размер ${v.width}×${v.height}, нужно ${WIDTH}×${HEIGHT}`);
if (Math.abs(v.fps - FPS) < 0.01) OK(`${FPS} fps`);
else F(`${v.fps.toFixed(2)} fps, нужно ${FPS}`);
if (v.hasAudio) OK('аудио есть');
else F('аудиодорожки нет');

// --- 2. против прокси и раскладки ------------------------------------------------
let ep = null;
let proxy = null;
if (feat.file) {
  try {
    ep = loadEpisode(feat.file);
  } catch (e) {
    W(`не смог загрузить ${rel(feat.file)}: ${e.message}`);
  }
}
if (ep) {
  const proxyPath = path.join(PUBLIC, ep.videoSrc);
  if (fs.existsSync(proxyPath)) {
    proxy = probeVideo(proxyPath);
    const dd = v.duration - proxy.duration;
    if (Math.abs(dd) <= 0.1) OK(`длительность ${v.duration.toFixed(2)} с как у прокси`);
    else F(`длительность ${v.duration.toFixed(2)} с, у прокси ${proxy.duration.toFixed(2)} с (Δ ${dd.toFixed(2)})`);
    if (v.frames === ep.durationInFrames) OK(`${v.frames} кадров = durationInFrames`);
    else W(`${v.frames} кадров, durationInFrames ${ep.durationInFrames}`);

    const sfx = ep.overlays.filter((o) => o.kind === 'sfx');
    const mute = sfx.map((o) => [o.from, o.to]);
    const a = volume(out, mute);
    const b = volume(proxyPath, mute);
    const dm = a.mean - b.mean;
    const where = sfx.length ? ` (без ${sfx.length} окон SFX)` : '';
    if (Number.isFinite(dm) && Math.abs(dm) <= 1.0) OK(`громкость mean ${a.mean} dB, у прокси ${b.mean} dB${where}`);
    else F(`громкость mean ${a.mean} dB против ${b.mean} dB у прокси (Δ ${dm.toFixed(1)})${where} — задвоение или потеря звука`);

    // SFX на месте: в своём окне рендер должен быть громче прокси
    for (const o of sfx) {
      const win = (file) => {
        const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-ss', o.from.toFixed(3), '-t', (o.to - o.from).toFixed(3), '-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'});
        return Number(/max_volume:\s*(-?[\d.]+)/.exec(r.stderr ?? '')?.[1]);
      };
      const d = win(out) - win(proxyPath);
      const tag = `sfx «${o.note}» ${o.from}–${o.to}с`;
      if (!Number.isFinite(d)) W(`${tag}: не смог замерить окно`);
      else if (d >= 0.5) OK(`${tag}: пик выше прокси на ${d.toFixed(1)} dB — звук лёг`);
      else W(`${tag}: пик выше прокси лишь на ${d.toFixed(1)} dB — звука не слышно или он тонет в речи, проверь ушами`);
    }
  } else {
    W(`прокси public/${ep.videoSrc} не найден — длительность и звук сверить не с чем`);
  }
} else if (!feat.file) {
  W(`фича ${feat.name} без episode.ts — сверка с раскладкой пропущена`);
}

// --- 3. последний кадр --------------------------------------------------------
const luma = lastFrameLuma(out);
if (Number.isFinite(luma)) {
  if (luma >= 16) OK(`последний кадр не чёрный (Y ${luma.toFixed(0)})`);
  else F(`последний кадр чёрный (Y ${luma.toFixed(0)})`);
} else {
  W('не смог прочитать яркость последнего кадра');
}

// --- 4. контактный лист по оверлеям -------------------------------------------
let sheet = null;
if (ep && ep.overlays.length) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-'));
  const legend = [];
  const COLS = 5;
  let n = 0;
  ep.overlays.forEach((o, i) => {
    if (o.kind === 'sfx') return; // звук на стиле не виден, он проверен по окнам выше
    // стил через ~12 кадров после влёта: карточка уже на месте, слово ещё то же
    const t = Math.min(o.from + 0.4, (o.from + o.to) / 2);
    const img = path.join(tmp, `${String(n).padStart(3, '0')}.jpg`);
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-v', 'error', '-y', '-ss', t.toFixed(3), '-i', out, '-frames:v', '1', '-vf', 'scale=300:-1', '-q:v', '3', img]);
    if (r.status === 0 && fs.existsSync(img)) {
      legend.push(`${String(n + 1).padStart(2)}. ${o.kind.padEnd(5)} ${o.from}–${o.to}с  ${o.note ?? ''}`);
      n++;
    } else {
      W(`не снял стил для #${i + 1} на ${t.toFixed(2)} с`);
    }
  });
  if (n) {
    sheet = out.replace(/\.mp4$/, '') + '.check.jpg';
    const rows = Math.ceil(n / COLS);
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-v', 'error', '-y', '-i', path.join(tmp, '%03d.jpg'), '-start_number', '0',
      '-vf', `tile=${COLS}x${rows}:margin=4:padding=4:color=0x222222`, '-frames:v', '1', '-q:v', '3', sheet]);
    if (r.status !== 0) {
      W(`не собрал контактный лист: ${r.stderr}`);
      sheet = null;
    }
  }
  fs.rmSync(tmp, {recursive: true, force: true});
  if (sheet) {
    console.log(`контактный лист: ${sheet}  (${COLS} в ряд, слева направо)`);
    for (const l of legend) console.log('  ' + l);
    console.log('  глазами: мем на своём слове · лицо и субтитры свободны · эмодзи цветные, не квадраты');
    console.log('');
  }
}

// --- вывод --------------------------------------------------------------------
console.log(`${rel(out)}${ep ? ` ← ${feat.name} (${ep.id})` : ''}`);
for (const m of oks) console.log(`  ✓ ${m}`);
for (const m of warns) console.log(`  ⚠ ${m}`);
for (const m of fails) console.log(`  ✗ ${m}`);
process.exit(fails.length ? 1 : 0);
