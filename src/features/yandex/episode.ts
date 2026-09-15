import type {Episode} from '../../shared/reel/types';

// Счётчик пунктов всегда в одной точке — так он читается именно как счётчик.
const COUNTER_X = 880;
const COUNTER_Y = 800;

// Здесь кадр просторнее, чем в «Devops»: над головой свободно почти 600 px,
// поэтому карточки крупные и чередуются лево/право.
export const yandex: Episode = {
  id: 'Yandex',
  videoSrc: 'episodes/yandex/0903_h264.mp4',
  durationInFrames: 2282,
  geometry: {
    hairTop: 595,
    eyes: 812,
    chin: 1025,
    subtitleTop: 1400,
    headLeft: 300,
    headRight: 675,
  },
  overlays: [
    // --- Пункт 1: культ алгоритмов ---
    {
      kind: 'emoji',
      note: '«1-ый пункт»',
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
      note: '«олимпиадные задачи»',
      from: 11.0,
      to: 13.5,
      src: 'pictures/monkey-math.jpg',
      width: 480,
      x: 790,
      y: 400,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«будем заставлять переписывать»',
      from: 15.8,
      to: 18.0,
      src: 'pictures/cat-pokaysya.jpg',
      width: 340,
      x: 270,
      y: 400,
      rotate: -6,
    },
    {
      kind: 'meme',
      note: '«параноик, который боится»',
      from: 19.3,
      to: 21.3,
      src: 'pictures/cat-loading.jpg',
      width: 400,
      x: 800,
      y: 400,
      rotate: 4,
    },

    // --- Пункт 2: твой код — говно ---
    {
      kind: 'emoji',
      note: '«2-ое»',
      from: 22.0,
      to: 22.9,
      char: '2️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«его код — полное говно»',
      from: 24.0,
      to: 26.0,
      src: 'pictures/boy-crying.jpg',
      width: 600,
      x: 330,
      y: 400,
      rotate: -4,
    },
    {
      kind: 'emoji',
      note: '«500К на валютных удалёнках»',
      from: 30.3,
      to: 31.4,
      char: '💸',
      // у Noto Color Emoji глиф «деньги с крыльями» имеет широкие поля и на одном
      // кегле с клавишами-цифрами смотрится заметно мельче — компенсируем
      size: 195,
      x: 180,
      y: 800,
      rotate: -12,
    },

    // --- Пункт 3: отдыхать нельзя ---
    {
      kind: 'emoji',
      note: '«и 3-ье, и самое важное»',
      from: 45.2,
      to: 46.1,
      char: '3️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'meme',
      note: '«ребёнок не может отдыхать»',
      from: 48.0,
      to: 50.2,
      src: 'pictures/baby-bath.jpg',
      width: 400,
      x: 790,
      y: 400,
      rotate: 5,
    },

    // --- Финал: идеальный сотрудник ---
    {
      kind: 'meme',
      note: '«повышением ЗП на 5% в год»',
      from: 63.3,
      to: 65.6,
      src: 'pictures/cat-wallet.jpg',
      width: 360,
      x: 260,
      y: 400,
      rotate: -5,
    },
    {
      kind: 'emoji',
      note: '«и крику его начальника»',
      from: 66.2,
      to: 67.2,
      char: '😱',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 10,
    },
  ],
};
