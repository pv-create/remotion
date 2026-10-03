import type {Episode} from '../../shared/reel/types';

// «Если бы персонажи Игры престолов работали в IT. Часть вторая» (0922), 50.0 с.
//
// Прокси 0922_intro12_body11: вступление до «Король ночи» (0–6.5 с оригинала)
// ускорено в 1.2 раза, всё после стыка (5.42 с) — в 1.1 раза. Первая шутка
// на 5.4 с вместо 6.7. Тайминги в пословной карте (notes.md) — по оригиналу:
// до 6.5 с делить на 1.2, после — 5.42 + (t − 6.5) / 1.1.
// Субтитры автор вшил сам, полоса 1470–1560 — в неё не лезем.
//
// Крупнее первой части: над головой ~420 px, голова 205–780 по ширине,
// брови ~770, глаза ~830. Карточки сидят над головой нижней кромкой около
// 740: y у каждой свой, считается от высоты (рамка 8 px). Одиночные — по
// центру, финальная пара «ибэшник и архитектор» — две карточки рядом.
//
// Пословная карта — measure/subtitles-fine.jpg, 8 кадров на ячейку
// (0.267 с), 10 в ряд = 2.67 с. Слово в ячейке уже стоит на экране,
// from берётся на ~0.15 с раньше. Кадры из сериала — public/pictures/got/.
//
// Отсылки к первой части: Арья (там ибэшник) на «одним коммитом» — она
// и убила Короля ночи одним ударом — и в финальной паре; Бран дважды.

// Парные карточки: левая и правая, над головой.
const PAIR_LEFT_X = 275;
const PAIR_RIGHT_X = 805;

// Одиночная карточка по центру над головой.
const SOLO_X = 540;

// Эмодзи-акценты — по бокам от головы, на уровне щёк.
const ACCENT_LEFT_X = 150;
const ACCENT_RIGHT_X = 930;
const ACCENT_Y = 900;

// Клик мыши на появление карточки: «картинка встала». Не на каждую — на
// открывающую пункт. Громкость 0.9: на рекомендованных 0.6 клик тонет в речи.
const CLICK = 'sfx/mouse-click.wav';

export const got2: Episode = {
  id: 'Got2',
  videoSrc: 'episodes/got2/0922_intro12_body11_h264.mp4',
  durationInFrames: 1500,
  geometry: {
    hairTop: 420,
    eyes: 830,
    chin: 1200,
    subtitleTop: 1470,
    headLeft: 205,
    headRight: 780,
  },
  overlays: [
    // --- Вступление (ускорено 1.2x): акценты на хуке и «в предыдущей серии» ---
    {
      kind: 'emoji',
      note: '«Игры престолов»',
      from: 1.33,
      to: 2.12,
      char: '🐉',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«работали в IT»',
      from: 2.2,
      to: 2.85,
      char: '💻',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«Вторая часть»',
      from: 2.9,
      to: 3.65,
      char: '✌️',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    // «Первая часть уже в профиле» — полоса из четырёх карточек первой части,
    // влетают по очереди слева направо, уходят вместе перед Королём ночи.
    {
      kind: 'meme',
      note: '«Первая часть» — Джон и Дейнерис',
      from: 3.67,
      to: 5.4,
      src: 'pictures/got/got-jon-dany.jpg',
      width: 230,
      x: 135,
      y: 617,
      rotate: -6,
    },
    {
      kind: 'meme',
      note: '«Первая часть» — Рамси',
      from: 3.97,
      to: 5.4,
      src: 'pictures/got/got-ramsay.jpg',
      width: 230,
      x: 405,
      y: 579,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«уже в профиле» — Нед',
      from: 4.27,
      to: 5.4,
      src: 'pictures/got/got-ned.jpg',
      width: 230,
      x: 675,
      y: 617,
      rotate: -5,
    },
    {
      kind: 'meme',
      note: '«смотри по ссылке» — Джоффри',
      from: 4.57,
      to: 5.4,
      src: 'pictures/got/got-joffrey.jpg',
      width: 230,
      x: 945,
      y: 527,
      rotate: 6,
    },

    // --- Пункт 1: Король ночи — техдолг ---
    {
      kind: 'meme',
      note: '«Король ночи»',
      from: 5.42,
      to: 8.6,
      src: 'pictures/got/got-night-king.jpg',
      width: 440,
      x: SOLO_X,
      y: 512,
      rotate: 4,
    },
    {
      kind: 'sfx',
      note: '«Король ночи» — клик, первая карточка',
      from: 5.42,
      to: 5.72,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'emoji',
      note: '«копится 8 лет»',
      from: 9.1,
      to: 10.15,
      char: '⏳',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«все боятся»',
      from: 10.28,
      to: 11.42,
      char: '😱',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«решается одним коммитом» — Арья, один удар',
      from: 11.51,
      to: 12.69,
      src: 'pictures/got/got-arya.jpg',
      width: 340,
      x: SOLO_X,
      y: 476,
      rotate: 4,
    },
    {
      kind: 'sfx',
      note: '«решается» — коммит прошёл, вместе с Арьей',
      from: 11.51,
      to: 11.86,
      src: 'sfx/notify-3.wav',
      volume: 0.8,
    },

    // --- Пункт 2: Робб Старк — разработчик из региона ---
    {
      kind: 'meme',
      note: '«Робб Старк» — Красная свадьба',
      from: 12.69,
      to: 16.15,
      src: 'pictures/got/got-robb.jpg',
      width: 420,
      x: SOLO_X,
      y: 522,
      rotate: -4,
    },
    {
      kind: 'emoji',
      note: '«приехал на корпоратив в Москву»',
      from: 17.06,
      to: 18.87,
      char: '🥂',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«его там сократили»',
      from: 19.01,
      to: 19.74,
      char: '✂️',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'sfx',
      note: '«сократили» — сабовый удар под Красную свадьбу',
      from: 19.01,
      to: 22.71,
      src: 'sfx/impact-sub.wav',
      volume: 0.5,
    },

    // --- Пункт 3: Одичалые — фрилансеры ---
    {
      kind: 'meme',
      note: '«Одичалые» — Тормунд',
      from: 19.74,
      to: 22.6,
      src: 'pictures/got/got-tormund.jpg',
      width: 380,
      x: SOLO_X,
      y: 450,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«им по кайфу работать по ГПХ»',
      from: 24.33,
      to: 25.78,
      char: '😎',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'meme',
      note: '«не заботятся о своей пенсии» — пустой кошелёк',
      from: 26.28,
      to: 27.69,
      src: 'pictures/cat-wallet.jpg',
      width: 400,
      x: SOLO_X,
      y: 482,
      rotate: 4,
    },

    // --- Пункт 4: Бран Старк — архитектор ---
    {
      kind: 'meme',
      note: '«Бран Старк»',
      from: 27.74,
      to: 30.6,
      src: 'pictures/got/got-bran.jpg',
      width: 420,
      x: SOLO_X,
      y: 522,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«после каждого инцидента»',
      from: 30.65,
      to: 31.69,
      char: '🔥',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«всё предвидел»',
      from: 32.33,
      to: 33.51,
      char: '🔮',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«в документации ничего не написано»',
      from: 34.51,
      to: 35.87,
      char: '🤷',
      size: 170,
      x: ACCENT_LEFT_X,
      y: ACCENT_Y,
      rotate: -8,
    },

    // --- Пункт 5: Мизинец — аналитик ---
    {
      kind: 'meme',
      note: '«Мизинец»',
      from: 35.97,
      to: 38.78,
      src: 'pictures/got/got-littlefinger.jpg',
      width: 400,
      x: SOLO_X,
      y: 492,
      rotate: -4,
    },
    {
      kind: 'sfx',
      note: '«Мизинец» — клик',
      from: 35.97,
      to: 36.27,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'emoji',
      note: '«всё просчитал»',
      from: 38.87,
      to: 40.06,
      char: '🧮',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'meme',
      note: '«сократил ибэшник» — Арья из первой части',
      from: 43.24,
      to: 45.6,
      src: 'pictures/got/got-arya.jpg',
      width: 340,
      x: PAIR_LEFT_X,
      y: 476,
      rotate: -5,
    },
    {
      kind: 'sfx',
      note: '«ибэшник» — клик, финальная пара',
      from: 43.24,
      to: 43.54,
      src: CLICK,
      volume: 0.9,
    },
    {
      kind: 'meme',
      note: '«и архитектор» — Бран второй раз',
      from: 44.24,
      to: 45.6,
      src: 'pictures/got/got-bran.jpg',
      width: 350,
      x: PAIR_RIGHT_X,
      y: 557,
      rotate: 5,
    },

    // --- Финал ---
    {
      kind: 'emoji',
      note: '«пишите в комментарии»',
      from: 45.69,
      to: 47.06,
      char: '💬',
      size: 170,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«подписывайтесь»',
      from: 48.1,
      to: 49.69,
      char: '🔔',
      size: 165,
      x: ACCENT_RIGHT_X,
      y: ACCENT_Y,
      rotate: 8,
    },
  ],
};
