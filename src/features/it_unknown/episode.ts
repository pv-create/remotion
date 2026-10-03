import type {Episode} from '../../shared/reel/types';

// «Три вещи в айти, которые невозможно объяснить» (0929), 46.2 с.
//
// Сатира-список: скрам-мастера → восемь статусов у задачи → офис, в конце
// «пишите в комментариях». Субтитры автор вшил сам, полоса 1460–1580.
//
// Кадр просторный: волосы с 280 (на хуке, дальше ~350), брови ~690, глаза
// 750. Карточки над головой по центру, нижняя кромка около 675 — y считается
// от высоты карточки (рамка 8 px). Эмодзи-акценты по бокам на уровне щёк.
//
// Пословная карта — measure/fine{0,1,2}.jpg: 8 кадров на ячейку (0.267 с),
// 6 в ряд = 1.6 с, лист = 16 с. Слово в ячейке уже на экране, from берётся
// чуть раньше.

const SOLO_X = 540;
const CARD_BOTTOM = 675;
const BORDER = 8;

// y центра карточки так, чтобы нижняя кромка легла на CARD_BOTTOM.
const cardY = (width: number, [w, h]: [number, number]) =>
  Math.round(CARD_BOTTOM - ((width * h) / w + BORDER * 2) / 2);

const ACCENT_LEFT_X = 120;
const ACCENT_RIGHT_X = 950;
const ACCENT_Y = 900;

export const itUnknown: Episode = {
  id: 'ItUnknown',
  videoSrc: 'episodes/it_unknown/0929_h264.mp4',
  durationInFrames: 1386,
  geometry: {
    hairTop: 280,
    eyes: 750,
    chin: 1070,
    subtitleTop: 1460,
    headLeft: 220,
    headRight: 780,
  },
  overlays: [
    // --- Хук ---
    {
      kind: 'emoji',
      note: '«Три вещи»',
      from: 0.05,
      to: 1.4,
      char: '3️⃣',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'meme',
      note: '«невозможно объяснить» — обезьяна с формулами',
      from: 1.5,
      to: 2.9,
      src: 'pictures/monkey-math.jpg',
      width: 520,
      x: SOLO_X,
      y: cardY(520, [735, 620]),
      rotate: -3,
    },

    // --- Пункт 1: скрам-мастера ---
    {
      kind: 'meme',
      note: '«скрам-мастера … объясняет, как правильно вести дейлики» — Чарли у доски',
      from: 3.65,
      to: 9.4,
      src: 'pictures/scrum.png',
      width: 620,
      x: SOLO_X,
      y: cardY(620, [1672, 941]),
      rotate: 3,
    },
    {
      kind: 'sfx',
      // клик мыши тонул в «скрам» (пик рендера = пик прокси), вуш шире по
      // спектру и слышен поверх голоса
      note: '«скрам» — вуш, карточка шлёпнулась',
      from: 3.65,
      to: 3.95,
      src: 'sfx/whoosh-short.wav',
      volume: 1,
    },
    {
      kind: 'emoji',
      note: '«неужели мы сами не можем понять»',
      from: 9.55,
      to: 11.1,
      char: '🙄',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«дейлики на 40 минут — это не норма» — кот тычет в часы',
      from: 12.45,
      to: 14.05,
      src: 'pictures/cat-time.jpg',
      width: 420,
      x: SOLO_X,
      y: cardY(420, [735, 918]),
      rotate: -4,
    },

    // --- Пункт 2: восемь статусов ---
    {
      kind: 'meme',
      note: '«восемь статусов у задач … новая, готова, готова к релизу…» — Джим у доски',
      from: 14.1,
      to: 21.0,
      src: 'pictures/status-board.png',
      width: 620,
      x: SOLO_X,
      y: cardY(620, [1122, 590]),
      rotate: -2,
    },
    {
      kind: 'sfx',
      note: '«восемь статусов» — серия щелчков под список',
      from: 14.1,
      to: 14.7,
      src: 'sfx/clicks.wav',
      startFrom: 0.15,
      volume: 0.6,
    },
    {
      kind: 'meme',
      note: '«никто не может понять, чем готова от готова к релизу отличается» — лошадь «почему»',
      from: 21.05,
      to: 24.75,
      src: 'pictures/why.jpg',
      width: 460,
      x: SOLO_X,
      y: cardY(460, [736, 736]),
      rotate: 3,
    },

    // --- Пункт 3: офис ---
    {
      kind: 'emoji',
      note: '«самое необъяснимое — это офис»',
      from: 27.1,
      to: 28.4,
      char: '🏢',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«тратить час на дорогу»',
      from: 30.6,
      to: 32.2,
      char: '🚗',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'sfx',
      note: '«час на дорогу» — сигнал машины',
      from: 30.6,
      to: 31.4,
      src: 'sfx/car.wav',
      volume: 0.65,
    },
    {
      kind: 'meme',
      note: '«сидеть на дейликах» — снова Чарли у доски',
      from: 35.15,
      to: 36.95,
      src: 'pictures/scrum.png',
      width: 620,
      x: SOLO_X,
      y: cardY(620, [1672, 941]),
      rotate: -3,
    },
    {
      kind: 'meme',
      note: '«с коллегами, которые подключились из дома» — кот за ноутбуком',
      from: 37.05,
      to: 38.35,
      src: 'pictures/cat-laptop.jpg',
      width: 460,
      x: SOLO_X,
      y: cardY(460, [736, 736]),
      rotate: 4,
    },

    // --- Концовка ---
    {
      kind: 'emoji',
      note: '«в комментариях пишите»',
      from: 38.4,
      to: 40.7,
      char: '💬',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«из лучшего соберу следующий выпуск»',
      from: 41.6,
      to: 43.6,
      char: '📝',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«подписывайтесь»',
      from: 43.95,
      to: 46.2,
      char: '🔔',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
  ],
};
