import type {Episode} from '../../shared/reel/types';

// «Если бы персонажи Игры престолов работали в IT» (0917b — второй экспорт
// автора, поправлено слово «монорепе», на 9 кадров длиннее первого), 50.4 с.
// Субтитры автор вшил сам, полоса 1460–1560 — в неё не лезем.
//
// Крупность средняя и стабильная: над головой ~500 px, голова 245–775 по
// ширине, брови ~795, глаза ~830. Карточки сидят над головой нижней кромкой
// около 740, чтобы не висеть в потолке: y у каждой свой, считается от высоты.
// Парные пункты (Джон+Дейнерис, Серсея+Джейме) — две карточки рядом,
// одиночные — одна по центру.
//
// Пословная карта — measure/subtitles-fine.jpg (второй экспорт), 8 кадров на
// ячейку (0.267 с), 15 в ряд = 4 с. До «монорепе» (14.4) тайминги совпадают
// с первым экспортом, дальше всё на ~0.3 с позже.
// Кадры из сериала — public/pictures/got/.

// Парные карточки: левая и правая, над головой.
const PAIR_LEFT_X = 275;
const PAIR_RIGHT_X = 805;

// Одиночная карточка по центру над головой.
const SOLO_X = 540;

// Эмодзи-акценты — по бокам от головы, на уровне шеи.
const ACCENT_LEFT_X = 150;
const ACCENT_RIGHT_X = 930;
const ACCENT_Y = 880;

// Клик мыши на появление карточки: «картинка встала». Не на каждую — на
// открывающую пункт, чтобы не превратить дорожку в щелчки. Громкость 0.9:
// на рекомендованных 0.6 пик клика равен пику голоса и его не слышно.
const CLICK = 'sfx/mouse-click.wav';

export const got: Episode = {
  id: 'Got',
  videoSrc: 'episodes/got/0917b_h264.mp4',
  durationInFrames: 1512,
  geometry: {
    hairTop: 505,
    eyes: 830,
    chin: 1115,
    subtitleTop: 1460,
    headLeft: 245,
    headRight: 775,
  },
  overlays: [
    // --- Пункт 1: Дейнерис и Джон Сноу, фронт и бэк ---
    {
      kind: 'meme',
      note: '«Дейнерис»',
      from: 3.1,
      to: 7.0,
      src: 'pictures/got/got-dany.jpg',
      width: 400,
      x: PAIR_LEFT_X,
      y: 532,
      rotate: -5,
    },
    {
      kind: 'sfx',
      note: '«Дейнерис» — клик, первая карточка',
      from: 3.1,
      to: 3.4,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'meme',
      note: '«Джон Сноу»',
      from: 3.9,
      to: 7.0,
      src: 'pictures/got/got-jon.jpg',
      width: 380,
      x: PAIR_RIGHT_X,
      y: 512,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«объединились, чтобы обсудить API»',
      from: 9.25,
      to: 12.3,
      src: 'pictures/got/got-jon-dany.jpg',
      width: 540,
      x: SOLO_X,
      y: 462,
      rotate: -3,
    },
    {
      kind: 'emoji',
      note: '«оказалось» — работали в одной монорепе',
      from: 12.45,
      to: 14.5,
      char: '😳',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'sfx',
      note: '«оказалось» — ошибка интерфейса',
      from: 12.45,
      to: 13.85,
      src: 'sfx/error-2.wav',
      startFrom: 0.15,
      volume: 0.75,
    },

    // --- Пункт 2: Рамси — тестировщик ---
    {
      kind: 'meme',
      note: '«Рамси Болтон»',
      from: 14.85,
      to: 17.7,
      src: 'pictures/got/got-ramsay.jpg',
      width: 420,
      x: SOLO_X,
      y: 452,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«где сломается»',
      from: 19.35,
      to: 20.4,
      char: '💥',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«не остановится, пока не найдёт» — Теон после его тестов',
      from: 20.7,
      to: 22.05,
      src: 'pictures/got/got-theon.jpg',
      width: 420,
      x: SOLO_X,
      y: 470,
      rotate: -4,
    },

    // --- Пункт 3: Нед Старк — новый проджект ---
    {
      kind: 'meme',
      note: '«Нед Старк» (в субтитрах автора «нет»)',
      from: 22.05,
      to: 25.0,
      src: 'pictures/got/got-ned.jpg',
      width: 430,
      x: SOLO_X,
      y: 517,
      rotate: 5,
    },
    {
      kind: 'sfx',
      note: '«Нед Старк» — клик',
      from: 22.05,
      to: 22.35,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'emoji',
      note: '«пытается во всём разобраться»',
      from: 27.6,
      to: 29.5,
      char: '🤔',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«не доживает до первого релиза»',
      from: 30.3,
      to: 32.2,
      src: 'pictures/got/got-ned-execution.jpg',
      width: 480,
      x: SOLO_X,
      y: 597,
      rotate: -3,
    },
    {
      kind: 'sfx',
      note: '«доживает» — сабовый удар под казнь',
      from: 30.3,
      to: 33.95,
      src: 'sfx/impact-sub.wav',
      volume: 0.5,
    },

    // --- Пункт 4: Арья — ИБ ---
    {
      kind: 'meme',
      note: '«Арья Старк»',
      from: 32.2,
      to: 34.7,
      src: 'pictures/got/got-arya.jpg',
      width: 370,
      x: SOLO_X,
      y: 454,
      rotate: 4,
    },

    // --- Пункт 5: Серсея и Джейме — фаундер и CTO, Джоффри — MVP ---
    {
      kind: 'meme',
      note: '«Серсея»',
      from: 37.5,
      to: 42.9,
      src: 'pictures/got/got-cersei.jpg',
      width: 350,
      x: PAIR_LEFT_X,
      y: 499,
      rotate: -5,
    },
    {
      kind: 'sfx',
      note: '«Серсея» — клик',
      from: 37.5,
      to: 37.8,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'meme',
      note: '«Джейме Ланнистер»',
      from: 38.55,
      to: 42.9,
      src: 'pictures/got/got-jaime.jpg',
      width: 360,
      x: PAIR_RIGHT_X,
      y: 502,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«выкатили Джоффри как свой первый MVP»',
      from: 43.9,
      to: 46.6,
      src: 'pictures/got/got-joffrey.jpg',
      width: 310,
      x: SOLO_X,
      y: 455,
      rotate: 4,
    },
    {
      kind: 'sfx',
      note: '«Джоффри» — клик',
      from: 43.9,
      to: 44.2,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'emoji',
      note: '«сразу же провалились»',
      from: 47.2,
      to: 47.95,
      char: '📉',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },

    // --- Финал ---
    {
      kind: 'emoji',
      note: '«подписывайся»',
      from: 47.95,
      to: 49.6,
      char: '🔔',
      size: 165,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
  ],
};
