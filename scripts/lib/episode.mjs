// Общее для скриптов пайплайна: загрузка episode.ts без сборки, ffprobe, пути.
// Файл раскладки — обычный TypeScript с `import type`, поэтому его достаточно
// транспилировать компилятором из node_modules и выполнить как CommonJS.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FEATURES = path.join(ROOT, 'src', 'features');
export const PUBLIC = path.join(ROOT, 'public');
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const require = createRequire(import.meta.url);
const ts = require(path.join(ROOT, 'node_modules', 'typescript'));

const cache = new Map();

function resolveTs(from, spec) {
  const base = path.resolve(path.dirname(from), spec);
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, path.join(base, 'index.ts')]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  throw new Error(`не нашёл модуль ${spec} из ${from}`);
}

/** Выполняет .ts-файл и возвращает его exports. Только для файлов данных. */
export function loadTs(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) {
    const v = JSON.parse(fs.readFileSync(file, 'utf8'));
    cache.set(file, v);
    return v;
  }
  const src = fs.readFileSync(file, 'utf8');
  const {outputText} = ts.transpileModule(src, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
    },
  });
  const module = {exports: {}};
  const localRequire = (spec) => {
    if (!spec.startsWith('.')) {
      throw new Error(`${path.relative(ROOT, file)} тянет «${spec}» — раскладка должна быть данными без рантайм-импортов`);
    }
    return loadTs(resolveTs(file, spec));
  };
  new Function('exports', 'require', 'module', '__filename', '__dirname', outputText)(
    module.exports, localRequire, module, file, path.dirname(file),
  );
  cache.set(file, module.exports);
  return module.exports;
}

/** Имя фичи или путь к episode.ts -> {name, dir, file}. */
export function featureFromArg(arg) {
  let dir;
  if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
    dir = path.dirname(path.resolve(arg));
  } else if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) {
    dir = path.resolve(arg);
  } else {
    dir = path.join(FEATURES, arg);
  }
  const name = path.basename(dir);
  const file = path.join(dir, 'episode.ts');
  const json = path.join(dir, 'episode.json');
  return {name, dir, file: fs.existsSync(file) ? file : null, json: fs.existsSync(json) ? json : null};
}

/** Достаёт объект Episode из exports (первый экспорт с overlays и videoSrc). */
export function loadEpisode(file) {
  const mod = loadTs(file);
  for (const v of Object.values(mod)) {
    if (v && typeof v === 'object' && Array.isArray(v.overlays) && typeof v.videoSrc === 'string') return v;
  }
  throw new Error(`${path.relative(ROOT, file)}: не нашёл экспорт с полями videoSrc и overlays`);
}

export function ffprobe(file, args) {
  return execFileSync('ffprobe', ['-v', 'error', ...args, file], {encoding: 'utf8'}).trim();
}

/** Основные параметры видео. nb_frames берётся из контейнера, при отсутствии считается. */
export function probeVideo(file) {
  const out = ffprobe(file, [
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames:format=duration',
    '-of', 'json',
  ]);
  const j = JSON.parse(out);
  const s = j.streams?.[0] ?? {};
  const [num, den] = String(s.r_frame_rate ?? '0/1').split('/').map(Number);
  let frames = Number(s.nb_frames);
  if (!Number.isFinite(frames) || frames <= 0) {
    frames = Number(ffprobe(file, ['-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0']));
  }
  const audio = ffprobe(file, ['-select_streams', 'a', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0']);
  return {
    width: Number(s.width),
    height: Number(s.height),
    fps: den ? num / den : 0,
    frames,
    duration: Number(j.format?.duration),
    hasAudio: audio.includes('audio'),
  };
}

/** Размер картинки (jpg/png) через ffprobe. */
export function probeImage(file) {
  const out = ffprobe(file, ['-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0']);
  const [w, h] = out.split(',').map(Number);
  return {width: w, height: h};
}

export function loadMemes() {
  const f = path.join(PUBLIC, 'pictures', 'memes.json');
  if (!fs.existsSync(f)) return new Map();
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  return new Map((j.memes ?? []).map((m) => [m.file, m]));
}

export function loadSfx() {
  const f = path.join(PUBLIC, 'sfx', 'sfx.json');
  if (!fs.existsSync(f)) return new Map();
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  return new Map((j.sfx ?? []).map((m) => [m.file, m]));
}

/** Длительность аудиофайла в секундах. */
export function probeAudioDuration(file) {
  return Number(ffprobe(file, ['-show_entries', 'format=duration', '-of', 'csv=p=0']));
}

export function rel(p) {
  return path.relative(ROOT, p);
}
