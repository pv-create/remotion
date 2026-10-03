import type {Episode} from '../../shared/reel/types';

// «Идеальное резюме бэкендера» (0915), 46.3 c. Субтитры вшиты автором по
// одному слову, полоса 1450–1600 — в неё не лезем.
//
// Крупность как в bcend_vospitanie: над головой ~210 px свободно от шапки
// Instagram, волосы с 310, брови 700, глаза 770, голова 200–730 по ширине.
// Рабочая полоса для карточек — 100…700: верх ниже интерфейса, низ выше
// бровей. Карточки чередуются лево/право.
//
// Пословная карта снята с вшитых субтитров по четверти секунды (кадры 0 и 7
// из каждых 15, полоса y=1440). script.txt — текст автора без таймингов.
//
// Счётчиков «первое/второе» в записи нет, есть только «и 3-ье, самое
// важное» — 3️⃣ ставится одно, это и есть шутка. Хор на «идеальное» автор снял
// совсем: в самом начале любой звук поверх речи мешает. 😇 остаётся без звука.

// Счётчик и CTA — справа от головы, над плечом.
const COUNTER_X = 920;
const COUNTER_Y = 830;

// Одиночные эмодзи-акценты — зеркально слева.
const ACCENT_X = 150;
const ACCENT_Y = 830;

export const resume: Episode = {
  id: 'Resume',
  videoSrc: 'episodes/resume/0915_h264.mp4',
  durationInFrames: 1387,
  geometry: {
    hairTop: 310,
    eyes: 770,
    chin: 1130,
    subtitleTop: 1450,
    headLeft: 200,
    headRight: 730,
  },
  overlays: [
    // --- Интро: идеальное резюме ---
    {
      kind: 'emoji',
      note: '«идеальное»',
      from: 2.25,
      to: 3.5,
      char: '😇',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«бекендера»',
      from: 3.5,
      to: 4.9,
      src: 'pictures/cat-laptop.jpg',
      width: 400,
      x: 800,
      y: 340,
      rotate: 5,
    },

    // --- Пункт 1: выдуманные истории про метрики ---
    {
      kind: 'meme',
      note: '«выдуманные истории» — грех, покайся',
      from: 5.25,
      to: 6.75,
      src: 'pictures/cat-pokaysya.jpg',
      width: 420,
      x: 270,
      y: 400,
      rotate: -5,
    },
    // Три метрики — три 📈 и три клика мышью, как галочки в списке. Автор
    // попросил их явно; линт ругается на плотность, это осознанно.
    {
      kind: 'emoji',
      note: '«конверсии»',
      from: 8.5,
      to: 9.4,
      char: '📈',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {kind: 'sfx', note: 'клик на «конверсии»', from: 8.5, to: 8.7, src: 'sfx/mouse-click.wav', volume: 1.0},
    {
      kind: 'emoji',
      note: '«ретеншены»',
      from: 9.5,
      to: 10.2,
      char: '📈',
      size: 170,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 6,
    },
    {kind: 'sfx', note: 'клик на «ретеншены»', from: 9.5, to: 9.7, src: 'sfx/mouse-click.wav', volume: 1.0},
    {
      kind: 'emoji',
      note: '«аптайм»',
      from: 10.25,
      to: 11.0,
      char: '📈',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {kind: 'sfx', note: 'клик на «аптайм»', from: 10.25, to: 10.45, src: 'sfx/mouse-click.wav', volume: 1.0},
    {
      kind: 'meme',
      note: '«время ответа» — единственное, что поднял',
      from: 13.0,
      to: 14.4,
      src: 'pictures/cat-loading.jpg',
      width: 400,
      x: 800,
      y: 350,
      rotate: 4,
    },

    // --- Пункт 2: список технологий ---
    {
      kind: 'emoji',
      note: '«широким»',
      from: 16.25,
      to: 17.2,
      char: '📚',
      size: 170,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«несуществующие»',
      from: 18.5,
      to: 19.6,
      char: '👻',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«блокчейн»',
      from: 21.5,
      to: 22.6,
      char: '⛓️',
      size: 170,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«никто не проверяет»',
      from: 24.5,
      to: 25.4,
      char: '🙈',
      // широкие поля — ×1.3 от обычного кегля
      size: 220,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },

    // --- Пункт 3: 10 лет опыта в 27 ---
    {
      kind: 'emoji',
      note: '«3-ье» — единственный счётчик в ролике',
      from: 25.5,
      to: 26.5,
      char: '3️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {kind: 'sfx', note: 'щелчок на «3-ье»', from: 25.5, to: 25.7, src: 'sfx/click.mp3', volume: 0.5},
    {
      kind: 'meme',
      note: '«от 10 лет»',
      from: 28.25,
      to: 29.6,
      src: 'pictures/cat-time.jpg',
      width: 360,
      x: 270,
      y: 360,
      rotate: -5,
    },
    {
      kind: 'emoji',
      note: '«27»',
      from: 30.5,
      to: 31.6,
      char: '🎂',
      size: 170,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«20 лет» — при возрасте 27',
      from: 34.4,
      to: 35.3,
      char: '🧓',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«го» — сурок',
      from: 35.55,
      to: 36.3,
      char: '🐹',
      size: 170,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«клуд кодом»',
      from: 37.0,
      to: 38.0,
      char: '🤖',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -6,
    },

    // --- CTA: телеграм-канал ---
    {
      kind: 'meme',
      note: '«Телеграм канал» — карточка канала, держится до конца',
      from: 41.5,
      to: 45.8,
      src: 'pictures/tg-mathkras.jpg',
      // 650 — предел: карточка поднята из скриншота 433 px, шире мылит
      width: 650,
      x: 740,
      y: 400,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«Телеграм канал»',
      from: 41.5,
      to: 43.0,
      char: '✈️',
      size: 170,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -10,
    },
    {kind: 'sfx', note: 'уведомление на «Телеграм»', from: 41.5, to: 41.8, src: 'sfx/notify.wav', volume: 0.6},
  ],
};
