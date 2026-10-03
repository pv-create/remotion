import type {Episode} from '../../shared/reel/types';

// «Главные IT-новости за неделю», выпуск 1 (0917_news), 71.7 с. Новый формат:
// хук про сто телеграм-каналов, три новости, к каждой одна ремарка.
// Субтитры автор вшил сам, полоса 1560–1690 — в неё не лезем.
// На 4–6 с автор вклеил чужой ролик «#aleksey_mercedes» под «Фатальная
// ошибка» — там своих оверлеев нет.
//
// Геометрия по measure/grid-20s.jpg и grid-3up.jpg (2, 45, 68 с — кадр
// стабильный). Волосы от 485, брови ~655, глаза 705, подбородок 915, голова
// 340–640. Над головой свободно ~240–640 (выше — шапка Instagram), справа
// от головы стена 660–1080 до самого стакана (y ≈ 1000).
//
// Пословная карта — measure/subtitles.jpg (SUB_Y=1540, ячейка полсекунды,
// 8 в ряд = 4 с), уточнение по четверти секунды — subtitles-fine.jpg.
// Расшифровка автора в script.txt даёт только три метки, таймингам там не верить.

// Эмодзи-акценты — по бокам от головы, на уровне носа. Линт не проверяет
// эмодзи на лицо, поэтому x держим за пределами 340–640 с запасом.
const ACCENT_LEFT_X = 150;
const ACCENT_RIGHT_X = 930;
const ACCENT_Y = 820;

// Одиночный крупный эмодзи над головой — там же, где карточки.
const TOP_X = 540;
const TOP_Y = 400;

const EMOJI = 170;
// Глифы с широкими полями (🙈) на общем кегле кажутся мельче — им ×1.3.
const EMOJI_WIDE = 240;

export const news01: Episode = {
  id: 'News01',
  videoSrc: 'episodes/news_01/0917_news_h264.mp4',
  durationInFrames: 2147,
  geometry: {
    hairTop: 485,
    eyes: 705,
    chin: 915,
    subtitleTop: 1550,
    headLeft: 340,
    headRight: 640,
  },
  overlays: [
    // --- Хук: «подписан на сто телеграм-каналов» — лавина самолётиков над
    // головой, одно уведомление на первый. Всё уходит до 4.0, где начинается
    // вклейка автора. ---
    {
      kind: 'emoji',
      note: '«телеграм» — самолётик 1',
      from: 1.0,
      to: 3.85,
      char: '✈️',
      size: 150,
      x: 330,
      y: 430,
      rotate: -12,
    },
    {kind: 'sfx', note: 'уведомление на первый самолётик', from: 1.0, to: 2.4, src: 'sfx/notify.wav', volume: 0.6},
    {
      kind: 'emoji',
      note: '«телеграм» — самолётик 2',
      from: 1.25,
      to: 3.85,
      char: '✈️',
      size: 150,
      x: 540,
      y: 350,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«каналов» — самолётик 3',
      from: 1.5,
      to: 3.85,
      char: '✈️',
      size: 150,
      x: 750,
      y: 430,
      rotate: 14,
    },
    {
      kind: 'emoji',
      note: '«отписываться»',
      from: 6.5,
      to: 7.5,
      char: '🗑️',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«главные IT-новости за неделю»',
      from: 7.4,
      to: 9.0,
      char: '📰',
      size: 200,
      x: TOP_X,
      y: TOP_Y,
      rotate: -4,
    },

    // --- Новость 1. Oracle: уволила одним днём. ---
    {
      kind: 'emoji',
      note: '«1-ое»',
      from: 9.0,
      to: 10.0,
      char: '1️⃣',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {kind: 'sfx', note: 'щелчок на «1-ое»', from: 9.0, to: 9.3, src: 'sfx/click.mp3', volume: 0.75},
    // На «уволила» стояла казнь Неда из got/ — автор снял: новость про живых
    // людей, кадр с плахой читался слишком жёстко. Слово несёт 📅 ниже.
    {
      kind: 'emoji',
      note: '«одним днём» — слово, которое автор просил выделить',
      from: 12.15,
      to: 13.5,
      char: '📅',
      size: 200,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«в 4 утра»',
      from: 16.5,
      to: 17.6,
      char: '🌙',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«в 6 утра» — на том же месте, время прошло',
      from: 18.0,
      to: 19.2,
      char: '☀️',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«не смогли войти в офис»',
      from: 22.0,
      to: 23.4,
      char: '🚪',
      size: EMOJI,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«доступы к своим учёткам»',
      from: 24.6,
      to: 26.0,
      char: '🔒',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    // 0.85, не рекомендованные 0.6: на 0.6 пик звука совпал с пиком речи
    // (−5.4 dB оба), check-render не увидел прибавки — звук тонул.
    {kind: 'sfx', note: 'ошибка доступа на «учёткам»', from: 24.6, to: 26.8, src: 'sfx/error.wav', startFrom: 0.1, volume: 0.85},
    {
      kind: 'meme',
      note: '«подумаешь о переработках» — кот у ноутбука',
      from: 29.0,
      to: 31.4,
      src: 'pictures/cat-laptop.jpg',
      width: 470,
      x: 540,
      y: 395,
      rotate: 3,
    },
    {
      kind: 'emoji',
      note: '«ради чего всё это»',
      from: 30.0,
      to: 31.3,
      char: '🤷',
      size: EMOJI,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -6,
    },

    // --- Новость 2. Anthropic: в плюсе, если не считать трат. ---
    {
      kind: 'emoji',
      note: '«2-ое»',
      from: 31.5,
      to: 32.5,
      char: '2️⃣',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {kind: 'sfx', note: 'щелчок на «2-ое»', from: 31.5, to: 31.8, src: 'sfx/click.mp3', volume: 0.75},
    {
      kind: 'emoji',
      note: '«работают в плюс»',
      from: 36.15,
      to: 37.1,
      char: '📈',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {kind: 'sfx', note: 'шелест денег на «в плюс»', from: 36.15, to: 37.55, src: 'sfx/money-2.wav', volume: 0.55},
    {
      kind: 'emoji',
      note: '«если не учитывать»',
      from: 37.0,
      to: 38.2,
      char: '🙈',
      size: EMOJI_WIDE,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«обучение моделей»',
      from: 40.0,
      to: 41.0,
      char: '🧠',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«вычислительные мощности»',
      from: 42.0,
      to: 43.2,
      char: '🖥️',
      size: EMOJI,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«я тоже в плюсе» — тот же график, тот же фокус',
      from: 45.3,
      to: 46.2,
      char: '📈',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«если не учитывать» — рефрен',
      from: 46.4,
      to: 47.3,
      char: '🙈',
      size: EMOJI_WIDE,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«платы за аренду и еду» — кот с пустым кошельком',
      from: 47.4,
      to: 49.8,
      src: 'pictures/cat-wallet.jpg',
      width: 400,
      x: 540,
      y: 380,
      rotate: -4,
    },

    // --- Новость 3. nginx: вышла новая версия, всё как обычно. ---
    {
      kind: 'emoji',
      note: '«3-ья»',
      from: 50.0,
      to: 51.0,
      char: '3️⃣',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    {kind: 'sfx', note: 'щелчок на «3-ья»', from: 50.0, to: 50.3, src: 'sfx/click.mp3', volume: 0.75},
    {
      kind: 'emoji',
      note: '«для технарей»',
      from: 51.0,
      to: 52.2,
      char: '🤓',
      size: EMOJI,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«а кто ещё может подписаться на этот канал, правда?»',
      from: 54.0,
      to: 55.3,
      char: '🤷',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 6,
    },
    // Логотипа nginx в наборе нет — на «новая версия» стоит кнопка NEW над
    // головой. Появится файл в pictures/logos/ — заменить на карточку.
    {
      kind: 'emoji',
      note: '«вышла новая версия»',
      from: 56.0,
      to: 57.3,
      char: '🆕',
      size: 200,
      x: TOP_X,
      y: TOP_Y,
      rotate: -4,
    },
    {kind: 'sfx', note: 'сухой щелчок на «новая» — деадпан', from: 56.0, to: 56.3, src: 'sfx/click.mp3', volume: 0.5},
    {
      kind: 'emoji',
      note: '«прирост производительности»',
      from: 58.0,
      to: 59.4,
      char: '🚀',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«всё как обычно»',
      from: 60.5,
      to: 62.0,
      char: '😐',
      size: EMOJI,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -4,
    },

    // --- Аутро: «в тех ста каналах» — те же самолётики, что в хуке. ---
    {
      kind: 'emoji',
      note: '«в тех ста каналах» — самолётик 1',
      from: 65.6,
      to: 67.6,
      char: '✈️',
      size: 150,
      x: 330,
      y: 430,
      rotate: -12,
    },
    {
      kind: 'emoji',
      note: '«в тех ста каналах» — самолётик 2',
      from: 65.85,
      to: 67.6,
      char: '✈️',
      size: 150,
      x: 540,
      y: 350,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«в тех ста каналах» — самолётик 3',
      from: 66.1,
      to: 67.6,
      char: '✈️',
      size: 150,
      x: 750,
      y: 430,
      rotate: 14,
    },
    {
      kind: 'emoji',
      note: '«не пропустить новые ролики»',
      from: 70.4,
      to: 71.5,
      char: '🔔',
      size: EMOJI,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
  ],
};
