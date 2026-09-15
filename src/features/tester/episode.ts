import type {Episode} from '../../shared/reel/types';

// Счётчик пунктов всегда в одной точке — так он читается именно как счётчик.
// Справа от головы, над плечом: голова по ширине не заходит правее 830,
// плечо начинается ниже 1100, поэтому полоса свободна.
const COUNTER_X = 910;
const COUNTER_Y = 830;

// Одиночные эмодзи-акценты — зеркально слева, чтобы не путались со счётчиком.
const ACCENT_X = 190;
const ACCENT_Y = 830;

// Крупность средняя: над головой свободно 270 px, голова гуляет в пределах
// 235–830 по ширине, брови не поднимаются выше 630. Значит рабочая полоса для
// карточек — 110…600 по вертикали: верх ниже интерфейса Instagram, низ выше
// бровей. Карточки чередуются лево/право, эмодзи-перечисление уходит в
// свободную полосу над головой (y 195, до волос ещё 75 px).
const LIST_Y = 195;

export const tester: Episode = {
  id: 'Tester',
  videoSrc: 'episodes/tester/0905b_h264.mp4',
  durationInFrames: 1717,
  geometry: {
    hairTop: 270,
    eyes: 712,
    chin: 1032,
    subtitleTop: 1452,
    headLeft: 235,
    headRight: 830,
  },
  overlays: [
    // --- Интро: кого воспитываем ---
    {
      kind: 'emoji',
      note: '«идеальный тестировщик»',
      from: 4.1,
      to: 5.3,
      char: '🔍',
      // лупа у Noto сидит по диагонали в широких полях — на кегле счётчика
      // читалась заметно мельче, поднято отдельно
      size: 205,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -10,
    },

    // --- Пункт 1: ничего не запрещать ---
    {
      kind: 'emoji',
      note: '«важно ничего не запрещать»',
      from: 6.0,
      to: 6.9,
      char: '1️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    // Молоко, огурцы и шпроты копятся в кадре: смешна не еда по отдельности,
    // а весь набор разом, поэтому все три висят до конца перечисления.
    {
      kind: 'emoji',
      note: '«молоко»',
      from: 9.0,
      to: 12.3,
      char: '🥛',
      size: 175,
      x: 260,
      y: LIST_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«солёные огурцы»',
      from: 10.2,
      to: 12.3,
      char: '🥒',
      size: 175,
      x: 540,
      y: LIST_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«и шпроты»',
      from: 11.2,
      to: 12.3,
      char: '🐟',
      size: 175,
      x: 820,
      y: LIST_Y,
      rotate: -5,
    },
    {
      kind: 'meme',
      note: '«описать последовательность действий»',
      from: 14.3,
      to: 16.4,
      src: 'pictures/monkey-math.jpg',
      width: 440,
      x: 800,
      y: 300,
      rotate: 5,
    },

    {
      kind: 'meme',
      note: '«описать его ощущения»',
      // встаёт на «съел», чтобы подпись на карточке успела прочитаться,
      // и уходит ровно под «2-ое»
      from: 17.0,
      to: 18.6,
      src: 'pictures/cat-ponos.jpg',
      // ровно родная ширина: выше — мылится, ниже — не читается подпись
      width: 500,
      x: 300,
      y: 330,
      rotate: -5,
    },

    // --- Пункт 2: никакого чувства вины ---
    {
      kind: 'emoji',
      note: '«и 2-ое, не менее важное»',
      from: 18.6,
      to: 19.6,
      char: '2️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«не должно быть чувства вины»',
      from: 22.7,
      to: 24.9,
      src: 'pictures/cat-pokaysya.jpg',
      width: 350,
      x: 255,
      y: 340,
      rotate: -6,
    },

    // --- Пункт 3: никому не доверять ---
    {
      kind: 'emoji',
      note: '«и 3-ье»',
      from: 28.0,
      to: 28.9,
      char: '3️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«никому не доверять»',
      from: 29.8,
      to: 30.9,
      char: '🤨',
      size: 165,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 9,
    },
    {
      kind: 'meme',
      note: '«он должен на ней попрыгать, повисеть»',
      from: 35.8,
      to: 38.1,
      src: 'pictures/baby-bath.jpg',
      width: 420,
      x: 800,
      y: 320,
      rotate: 5,
    },
    {
      kind: 'emoji',
      note: '«проверить, что полка крепко висит»',
      from: 41.6,
      to: 42.9,
      char: '✅',
      size: 165,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -7,
    },
    {
      kind: 'meme',
      note: '«так у вас получится идеальный тестировщик»',
      from: 43.4,
      to: 45.8,
      src: 'pictures/cat-laptop.jpg',
      width: 400,
      x: 270,
      y: 330,
      rotate: -5,
    },

    // --- Финал: баг за PlayStation ---
    {
      kind: 'emoji',
      note: '«заведёт на вас баг»',
      from: 48.2,
      to: 49.4,
      char: '🐛',
      // гусеница вытянута по горизонтали, полей сверху и снизу много
      size: 190,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 10,
    },
    {
      kind: 'meme',
      note: '«за то, что не купили ему PlayStation»',
      from: 49.7,
      to: 51.8,
      src: 'pictures/boy-crying.jpg',
      width: 580,
      x: 750,
      y: 320,
      rotate: -4,
    },
  ],
};
