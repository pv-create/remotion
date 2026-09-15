import type {Episode} from '../../shared/reel/types';

// Счётчик пунктов всегда в одной точке — так он читается именно как счётчик.
// Ниже карточек, над грудью, поверх шкафа.
const COUNTER_X = 900;
const COUNTER_Y = 850;

// Кадр тесный: над головой места нет, голова сидит левее центра. Свободен
// только правый блок шириной ~355 px, поэтому карточки уходят в правый верхний
// угол, ширина ограничена ~420 px, нижняя кромка держится выше бровей (y 600) —
// тогда мем перекрывает волосы, но не лицо.
const RIGHT_X = 815;

export const devops: Episode = {
  id: 'Devops',
  videoSrc: 'episodes/devops/0904_h264.mp4',
  durationInFrames: 1415,
  geometry: {
    hairTop: 212,
    eyes: 712,
    chin: 1090,
    subtitleTop: 1306,
    headLeft: 137,
    headRight: 725,
  },
  overlays: [
    // --- Пункт 1: забираем сон ---
    {
      kind: 'emoji',
      note: '«в 1-ую очередь»',
      from: 4.0,
      to: 4.9,
      char: '1️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'meme',
      note: '«в 3 часа ночи поднимайте»',
      from: 8.2,
      to: 10.3,
      src: 'pictures/cat-time.jpg',
      width: 420,
      x: RIGHT_X,
      y: 320,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«ложите его обратно спать»',
      from: 12.3,
      to: 14.2,
      src: 'pictures/boy-crying.jpg',
      width: 460,
      x: 780,
      y: 300,
      rotate: -4,
    },
    {
      kind: 'meme',
      note: '«чтобы починить прод»',
      from: 17.9,
      to: 19.6,
      src: 'pictures/cat-loading.jpg',
      width: 400,
      x: 830,
      y: 350,
      rotate: 4,
    },

    // --- Пункт 2: забираем признание. В озвучке слова «второе» нет, счётчик
    // держится только на эмодзи. ---
    {
      kind: 'emoji',
      note: '«заставляйте много работать» (маркера в озвучке нет)',
      from: 19.9,
      to: 20.8,
      char: '2️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«чтобы никто не замечал»',
      from: 22.8,
      to: 23.8,
      char: '🙈',
      // как и у 💸: глиф с широкими полями, на общем кегле выглядит мельче цифр
      size: 205,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 10,
    },
    {
      kind: 'meme',
      note: '«помыть пол во всей квартире»',
      from: 25.8,
      to: 27.8,
      src: 'pictures/baby-bath.jpg',
      width: 400,
      x: 800,
      y: 330,
      rotate: -5,
    },

    // --- Пункт 3: забираем личное пространство ---
    {
      kind: 'emoji',
      note: '«Третье»',
      from: 33.2,
      to: 34.1,
      char: '3️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'meme',
      note: '«он всегда должен быть с ноутбуком»',
      from: 39.2,
      to: 41.3,
      src: 'pictures/cat-laptop.jpg',
      width: 420,
      x: 820,
      y: 345,
      rotate: 5,
    },

    // --- Финал: «вы получите идеального девопса» — и работать он будет за так ---
    {
      kind: 'meme',
      note: 'финал: «вы получите идеального девопса»',
      from: 44.8,
      to: 46.6,
      src: 'pictures/cat-wallet.jpg',
      width: 400,
      x: 810,
      y: 330,
      rotate: -6,
    },
  ],
};
