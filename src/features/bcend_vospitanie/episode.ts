import type {Episode} from '../../shared/reel/types';

// «Как воспитать идеального бэкендера» (0910), 36.5 c. Субтитры вшиты
// автором, полоса 1440–1600 — в неё не лезем.
//
// Крупность как в tester_new: над головой ~300 px, голова 280–810 по ширине,
// брови на 640. Рабочая полоса для карточек — 110…600: верх ниже интерфейса
// Instagram, низ выше бровей. Карточки чередуются лево/право.
//
// Пословная карта снята с вшитых субтитров по четверти секунды
// (measure/subtitles.jpg — полсекунды, SUB_Y=1420). script.txt автора —
// только текст, таймингов там нет.
//
// Щелчок (public/sfx/click.mp3) стоит только на счётчике пунктов: звук как
// переключение, без картинки не ставим. Эмодзи 0️⃣ на «самооценка на нуле»
// автор снял — место остаётся пустым.

// Счётчик пунктов — справа от головы, над плечом.
const COUNTER_X = 910;
const COUNTER_Y = 830;

// Одиночные эмодзи-акценты — зеркально слева.
const ACCENT_X = 190;
const ACCENT_Y = 830;

const CLICK = 'sfx/click.mp3';

export const bcendVospitanie: Episode = {
  id: 'BcendVospitanie',
  videoSrc: 'episodes/bcend_vospitanie/0910_h264.mp4',
  durationInFrames: 1094,
  geometry: {
    hairTop: 300,
    eyes: 690,
    chin: 1040,
    subtitleTop: 1440,
    headLeft: 280,
    headRight: 810,
  },
  overlays: [
    // --- Интро: кого воспитываем ---
    {
      kind: 'meme',
      note: '«идеального бэкендера»',
      from: 1.75,
      to: 3.0,
      src: 'pictures/cat-laptop.jpg',
      width: 400,
      x: 270,
      y: 330,
      rotate: -5,
    },

    // --- Пункт 1: самооценка на нуле ---
    {
      kind: 'emoji',
      note: '«1-ое»',
      from: 3.0,
      to: 3.9,
      char: '1️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {kind: 'sfx', note: 'щелчок на «1-ое»', from: 3.0, to: 3.2, src: CLICK, volume: 0.5},
    {
      kind: 'emoji',
      note: '«никогда не хвалите»',
      from: 5.9,
      to: 7.0,
      char: '🙅',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«тестировщика»',
      from: 12.45,
      to: 13.4,
      char: '🔍',
      // лупа у Noto сидит по диагонали в широких полях — чуть крупнее
      size: 190,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -10,
    },
    {
      kind: 'emoji',
      note: '«архитектора»',
      from: 13.7,
      to: 14.3,
      char: '📐',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 8,
    },

    // --- Пункт 2: не выпускать на улицу ---
    {
      kind: 'emoji',
      note: '«2-ое»',
      from: 14.25,
      to: 15.1,
      char: '2️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
    {kind: 'sfx', note: 'щелчок на «2-ое»', from: 14.25, to: 14.45, src: CLICK, volume: 0.5},
    {
      kind: 'meme',
      note: '«не выпускайте ребёнка на улицу»',
      from: 15.95,
      to: 17.7,
      src: 'pictures/boy-crying.jpg',
      width: 580,
      x: 750,
      y: 320,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«усидчивость»',
      from: 18.95,
      to: 19.9,
      char: '🪑',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«спринта»',
      from: 21.45,
      to: 22.0,
      char: '🏃',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 8,
    },

    // --- Пункт 3: работать с 12 лет ---
    {
      kind: 'emoji',
      note: '«3-ье»',
      from: 22.0,
      to: 22.9,
      char: '3️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {kind: 'sfx', note: 'щелчок на «3-ье»', from: 22.0, to: 22.2, src: CLICK, volume: 0.5},
    {
      kind: 'emoji',
      note: '«начать работать»',
      from: 25.2,
      to: 26.0,
      char: '👷',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«успеть к 18»',
      from: 25.95,
      to: 27.4,
      src: 'pictures/cat-time.jpg',
      width: 360,
      x: 270,
      y: 340,
      rotate: -5,
    },
    {
      kind: 'emoji',
      note: '«коммерческий опыт»',
      from: 27.45,
      to: 28.5,
      char: '💼',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 8,
    },

    // --- Финал: идеальный бэкендер кормит семью ---
    {
      kind: 'meme',
      note: '«идеального бэкенд-разработчика» — повтор интро',
      from: 29.7,
      to: 31.2,
      src: 'pictures/cat-laptop.jpg',
      width: 400,
      x: 800,
      y: 330,
      rotate: 5,
    },
    {
      kind: 'emoji',
      note: '«обеспечивать всю вашу семью»',
      from: 32.7,
      to: 34.0,
      char: '💸',
      // широкие поля — ×1.3 от обычного кегля
      size: 250,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«подписывайся»',
      from: 34.45,
      to: 35.9,
      char: '🔔',
      size: 165,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
  ],
};
