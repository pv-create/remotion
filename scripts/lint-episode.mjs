#!/usr/bin/env node
// Проверка раскладки выпуска по жёстким правилам из CLAUDE.md.
//   node scripts/lint-episode.mjs <фича | src/features/<фича>/episode.ts>
// Код выхода 1, если есть ошибки. Предупреждения на код не влияют.
import fs from 'node:fs';
import path from 'node:path';
import {
  FEATURES, FPS, HEIGHT, PUBLIC, ROOT, WIDTH,
  featureFromArg, loadEpisode, loadMemes, loadSfx, probeAudioDuration, probeImage, probeVideo, rel,
} from './lib/episode.mjs';

const arg = process.argv[2];
if (!arg) {
  console.error('укажи фичу: node scripts/lint-episode.mjs devops');
  process.exit(2);
}

const errors = [];
const warns = [];
const infos = [];
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);
const I = (m) => infos.push(m);

const feat = featureFromArg(arg);
if (!feat.file) {
  if (feat.json) {
    console.log(`${feat.name}: motion-выпуск (episode.json), линт раскладки к нему не применяется`);
    process.exit(0);
  }
  console.error(`${feat.name}: нет episode.ts`);
  process.exit(2);
}

let ep;
try {
  ep = loadEpisode(feat.file);
} catch (e) {
  console.error(`✗ ${rel(feat.file)}: ${e.message}`);
  process.exit(1);
}

// --- видео-прокси -----------------------------------------------------------
const proxyPath = path.join(PUBLIC, ep.videoSrc);
if (!ep.videoSrc.startsWith('episodes/')) E(`videoSrc «${ep.videoSrc}» должен лежать в public/episodes/<фича>/`);
if (ep.videoSrc.includes('source/')) E(`videoSrc указывает на оригинал — работать только с прокси`);
let video = null;
if (!fs.existsSync(proxyPath)) {
  E(`прокси не найден: public/${ep.videoSrc} (пережечь: ./scripts/proxy.sh ${feat.name} "<vf>")`);
} else {
  video = probeVideo(proxyPath);
  if (video.width !== WIDTH || video.height !== HEIGHT) E(`прокси ${video.width}×${video.height}, ожидается ${WIDTH}×${HEIGHT}`);
  if (Math.abs(video.fps - FPS) > 0.01) E(`прокси ${video.fps.toFixed(2)} fps, ожидается ${FPS}`);
  const want = video.frames - 1;
  if (ep.durationInFrames !== want) {
    E(`durationInFrames = ${ep.durationInFrames}, а в прокси ${video.frames} кадров → должно быть ${want}`);
  }
}
const totalSec = ep.durationInFrames / FPS;

// --- геометрия ----------------------------------------------------------------
const g = ep.geometry ?? {};
for (const k of ['hairTop', 'eyes', 'chin', 'subtitleTop', 'headLeft', 'headRight']) {
  if (typeof g[k] !== 'number') E(`geometry.${k} не задан — сначала замер по frames.jpg`);
}
const geomOk = errors.length === 0 || ['eyes', 'subtitleTop'].every((k) => typeof g[k] === 'number');
if (geomOk && !(g.hairTop < g.eyes && g.eyes < g.chin && g.chin < g.subtitleTop)) {
  E(`geometry по вертикали не по порядку: hairTop ${g.hairTop} < eyes ${g.eyes} < chin ${g.chin} < subtitleTop ${g.subtitleTop}`);
}
if (geomOk && [g.eyes, g.chin, g.subtitleTop].every((v) => v === 0)) E('geometry нулевая — раскладка без замера');

// --- оверлеи ------------------------------------------------------------------
const memes = loadMemes();
const sfxIndex = loadSfx();
const IG_UI_BOTTOM = 100; // выше этой линии — шапка интерфейса Instagram (Reels, камера)
const WIDE_GLYPHS = ['💸', '🙈', '🙉', '🙊'];
const memeSpans = [];
const emojiSizes = [];

ep.overlays.forEach((o, i) => {
  const tag = `#${i + 1} ${o.kind} ${o.note ?? ''} ${o.from}–${o.to}с`;
  if (!(o.from >= 0)) E(`${tag}: from < 0`);
  if (!(o.to > o.from)) E(`${tag}: to должен быть больше from`);
  if (o.to > totalSec + 0.05) E(`${tag}: to = ${o.to}с выходит за длину ролика ${totalSec.toFixed(2)}с`);
  if (Math.round((o.to - o.from) * FPS) < 8 && o.kind !== 'cut' && o.kind !== 'sfx') W(`${tag}: короче 8 кадров, влёт не успеет`);

  if (o.kind === 'meme') {
    const file = path.join(PUBLIC, o.src);
    if (!fs.existsSync(file)) {
      E(`${tag}: картинка не найдена: public/${o.src}`);
      return;
    }
    const base = path.basename(o.src);
    const m = memes.get(base);
    let size;
    if (m) {
      size = {width: m.size[0], height: m.size[1]};
      if (o.width > m.maxWidth) E(`${tag}: width ${o.width} > maxWidth ${m.maxWidth} из описи (memes.json / logos.json / got.json) — замылит`);
      if (m.bg === 'white') I(`${tag}: у ${base} bg=white — на светлом фоне проверить, что тень читается`);
    } else {
      W(`${tag}: ${base} нет в описи (memes.json / logos/logos.json / got/got.json) — нет maxWidth, размер взят с файла`);
      size = probeImage(file);
    }
    const BORDER = 8;
    const h = (o.width * size.height) / size.width + BORDER * 2;
    const w = o.width + BORDER * 2;
    const top = o.y - h / 2;
    const bottom = o.y + h / 2;
    const left = o.x - w / 2;
    const right = o.x + w / 2;
    // под подбородком: целиком между подбородком и субтитрами — лицо не задето
    const belowChin = top >= g.chin && bottom <= g.subtitleTop;
    if (geomOk && belowChin) {
      I(`${tag}: на груди, ${Math.round(top)}–${Math.round(bottom)} между подбородком (${g.chin}) и субтитрами (${g.subtitleTop}) — на рендере проверить, что голова не опускается`);
    } else if (geomOk) {
      if (bottom > g.eyes) E(`${tag}: нижняя кромка ${Math.round(bottom)} ниже глаз (${g.eyes}) — мем на лице`);
      else if (bottom > g.eyes - 40) W(`${tag}: нижняя кромка ${Math.round(bottom)} впритык к глазам (${g.eyes}), с учётом наклона может задеть`);
      if (bottom > g.subtitleTop) E(`${tag}: заходит на субтитры (${g.subtitleTop})`);
    }
    if (top < IG_UI_BOTTOM) I(`${tag}: верхняя кромка ${Math.round(top)} заходит под шапку Instagram (граница ~${IG_UI_BOTTOM}) — глянуть на рендере`);
    if (left < -20 || right > WIDTH + 20) W(`${tag}: карточка выходит за кадр по ширине (${Math.round(left)}–${Math.round(right)})`);
    memeSpans.push({i: i + 1, from: o.from, to: o.to});
  }

  if (o.kind === 'emoji') {
    if (!o.char) E(`${tag}: пустой char`);
    if (!(o.size > 0)) E(`${tag}: size не задан`);
    if (o.y > (g.subtitleTop ?? HEIGHT)) E(`${tag}: центр эмодзи ниже полосы субтитров`);
    emojiSizes.push({tag, char: o.char, size: o.size});
  }

  if (o.kind === 'broll') {
    if (!o.src?.startsWith('broll/')) E(`${tag}: подсъём должен лежать в public/broll/`);
    else if (!fs.existsSync(path.join(PUBLIC, o.src))) E(`${tag}: прокси подсъёма не найден: public/${o.src}`);
    if (!['full', 'card'].includes(o.mode)) E(`${tag}: mode должен быть 'full' или 'card'`);
    if (o.mode === 'card' && [o.width, o.x, o.y].some((v) => typeof v !== 'number')) E(`${tag}: для mode 'card' нужны width, x, y`);
  }

  if (o.kind === 'cut' && !o.spec) E(`${tag}: у перебивки нет spec`);

  if (o.kind === 'sfx') {
    const file = path.join(PUBLIC, o.src ?? '');
    if (!o.src?.startsWith('sfx/')) E(`${tag}: звук должен лежать в public/sfx/`);
    else if (!fs.existsSync(file)) E(`${tag}: звук не найден: public/${o.src}`);
    else {
      const base = path.basename(o.src);
      const m = sfxIndex.get(base);
      if (!m) W(`${tag}: ${base} нет в sfx.json — допиши описание, hit и рекомендуемую громкость`);
      const dur = m?.duration ?? probeAudioDuration(file);
      const start = o.startFrom ?? 0;
      if (start < 0) E(`${tag}: startFrom < 0`);
      if (start >= dur) E(`${tag}: startFrom ${start} за концом звука (${dur.toFixed(2)}с)`);
      const audible = (m?.tail ?? dur) - start; // сколько реально слышно после startFrom
      if (o.to - o.from < Math.min(audible, dur - start) - 0.02) {
        W(`${tag}: окно ${(o.to - o.from).toFixed(2)}с короче звука (${audible.toFixed(2)}с после startFrom) — обрежется, если это не задумано ставь to ≥ ${(o.from + audible).toFixed(2)}`);
      }
      if (typeof o.volume === 'number' && !(o.volume > 0 && o.volume <= 1)) E(`${tag}: volume ${o.volume} вне 0…1`);
      if (typeof o.volume !== 'number' && m?.volume && Math.abs(m.volume - 0.5) >= 0.2) {
        W(`${tag}: volume не задан, по умолчанию 0.5, а для ${base} рекомендовано ${m.volume}`);
      }
      if (typeof o.volume === 'number' && m?.volume && o.volume > m.volume * 1.5) W(`${tag}: volume ${o.volume} заметно выше рекомендованных ${m.volume} из sfx.json — забьёт озвучку`);
      // удар должен лечь на from: у разгонов и импактов он не в начале файла
      const hit = m?.hit ?? 0;
      const hitAt = o.from + Math.max(0, hit - start);
      if (hit - start > 0.15) {
        W(`${tag}: удар у ${base} на ${hit}с файла, а startFrom ${start} — придёт на ${hitAt.toFixed(2)}с, через ${(hit - start).toFixed(2)}с после from. Чтобы ударить на слове: startFrom: ${hit}`);
      }
      const hasVisual = ep.overlays.some((v) => v !== o && v.kind !== 'sfx' && Math.abs(v.from - hitAt) <= 0.15);
      if (!hasVisual) I(`${tag}: на момент удара (${hitAt.toFixed(2)}с, ±0.15с) нет визуального оверлея — звук без картинки читается как брак дорожки`);
    }
  }
});

// эмодзи с широкими полями на общем кегле кажутся мельче — им ×1.3
const regular = emojiSizes.filter((e) => !WIDE_GLYPHS.includes(e.char)).map((e) => e.size);
if (regular.length) {
  const common = Math.max(...regular);
  for (const e of emojiSizes) {
    if (WIDE_GLYPHS.includes(e.char) && e.size < common * 1.2) {
      W(`${e.tag}: ${e.char} с широкими полями стоит на ${e.size} при обычных ${common} — обычно нужно ~×1.3`);
    }
  }
}

// SFX: минимализм. Не чаще одного на 10 с и не два подряд ближе 3 с.
const sfxTimes = ep.overlays.filter((o) => o.kind === 'sfx').map((o) => o.from).sort((a, b) => a - b);
const sfxCap = Math.max(1, Math.floor(totalSec / 10));
if (sfxTimes.length > sfxCap) W(`SFX ${sfxTimes.length} на ${totalSec.toFixed(0)} с — перебор, потолок ~${sfxCap} (один на 10 с). Оставь только сильные места`);
for (let k = 1; k < sfxTimes.length; k++) {
  if (sfxTimes[k] - sfxTimes[k - 1] < 3) W(`SFX на ${sfxTimes[k - 1]}с и ${sfxTimes[k]}с ближе 3 с друг к другу — слипнутся в шум, один убрать`);
}

// два мема одновременно
memeSpans.sort((a, b) => a.from - b.from);
for (let k = 1; k < memeSpans.length; k++) {
  const a = memeSpans[k - 1];
  const b = memeSpans[k];
  if (b.from < a.to - 0.05) W(`мемы #${a.i} и #${b.i} перекрываются по времени (${b.from}–${a.to}с)`);
}

// сильные мемы — в первые 15 секунд (удержание падает после этого)
if (memeSpans.length && !memeSpans.some((s) => s.from < 15)) I('в первые 15 с ни одного мема — удержание держится именно на них');
if (ep.overlays.length === 0) W('оверлеев нет');

// --- реестр и скрипты ---------------------------------------------------------
const index = fs.readFileSync(path.join(FEATURES, 'index.ts'), 'utf8');
if (!index.includes(`'./${feat.name}/episode'`)) W(`фича не зарегистрирована в src/features/index.ts`);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
if (!pkg.scripts?.[`render:${feat.name}`]) W(`в package.json нет скрипта render:${feat.name}`);
const notes = path.join(feat.dir, 'notes.md');
if (!fs.existsSync(notes)) W('нет notes.md с геометрией и грейдом');

// --- вывод --------------------------------------------------------------------
const head = `${feat.name} (${ep.id}): ${ep.overlays.length} оверлеев, ${totalSec.toFixed(1)} с`;
console.log(head);
for (const m of errors) console.log(`  ✗ ${m}`);
for (const m of warns) console.log(`  ⚠ ${m}`);
for (const m of infos) console.log(`  ℹ ${m}`);
if (!errors.length && !warns.length) console.log('  ✓ чисто');
process.exit(errors.length ? 1 : 0);
