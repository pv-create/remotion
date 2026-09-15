import type {Episode} from '../../shared/reel/types';

// Пересъёмка «Тестировщика» (0908). Субтитры автор вшил сам (CapCut), полоса
// 1440–1560 замерена — в неё не лезем.
//
// Крупность близкая к прошлому дублю: над головой ~290 px, голова 270–800 по
// ширине, брови на 610–640. Во вступлении (0–2.7 c) он ближе к камере: голова
// 130–740 (с ухом до 760), поэтому одиночный акцент там уходит вправо.
// Рабочая полоса для карточек — 110…600: верх ниже интерфейса Instagram,
// низ выше бровей. Карточки чередуются лево/право.
//
// На 2.6–3.9 c у автора своя вставка (клип с ребёнком) — туда ничего не кладём.
//
// Пословная карта снята с вшитых субтитров, четверть секунды на плитку.
// subtitles_ru.srt автора для таймингов не годится: его фразы плывут, к концу
// отставание доходит до девяти секунд. Текст там тоже не полный — в ролике
// после «тестировщик» есть ещё хвост про службу опеки и бэкендера.

// Счётчик пунктов всегда в одной точке — справа от головы, над плечом.
const COUNTER_X = 910;
const COUNTER_Y = 830;

// Одиночные эмодзи-акценты — зеркально слева.
const ACCENT_X = 190;
const ACCENT_Y = 830;

// Перечисление еды — в свободной полосе над головой, до волос ещё ~95 px.
const LIST_Y = 195;

export const testerNew: Episode = {
  id: 'TesterNew',
  videoSrc: 'episodes/tester_new/0908_h264.mp4',
  durationInFrames: 1767,
  geometry: {
    hairTop: 290,
    eyes: 690,
    chin: 1080,
    subtitleTop: 1440,
    headLeft: 270,
    headRight: 800,
  },
  overlays: [
    // --- Интро: кого воспитываем ---
    {
      kind: 'emoji',
      note: '«идеального тестировщика»',
      from: 1.6,
      to: 2.7,
      char: '🔍',
      // лупа у Noto сидит по диагонали в широких полях — поднята отдельно
      size: 205,
      // во вступлении лицо шире, слева места нет — акцент справа, ближе к
      // краю, чем счётчик
      x: 960,
      y: COUNTER_Y,
      rotate: -10,
    },

    // --- Пункт 1: ничего не запрещать ---
    {
      kind: 'emoji',
      note: '«с 1-ого дня»',
      from: 4.15,
      to: 5.1,
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
      from: 8.15,
      to: 10.9,
      char: '🥛',
      size: 175,
      x: 260,
      y: LIST_Y,
      rotate: -8,
    },
    {
      kind: 'emoji',
      note: '«солёные огурцы»',
      from: 9.4,
      to: 10.9,
      char: '🥒',
      size: 175,
      x: 540,
      y: LIST_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«и шпроты»',
      from: 10.15,
      to: 10.9,
      char: '🐟',
      size: 175,
      x: 820,
      y: LIST_Y,
      rotate: -5,
    },
    {
      kind: 'meme',
      note: '«описать последовательность действий»',
      from: 14.15,
      to: 15.9,
      src: 'pictures/monkey-math.jpg',
      width: 440,
      x: 800,
      y: 300,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«описать свои ощущения»',
      from: 16.85,
      to: 18.7,
      src: 'pictures/cat-ponos.jpg',
      // ровно родная ширина: выше — мылится, ниже — не читается подпись
      width: 500,
      x: 300,
      y: 330,
      rotate: -5,
    },
    {
      kind: 'emoji',
      note: '«создавать баг-репорты»',
      from: 20.65,
      to: 21.7,
      char: '🐛',
      // гусеница вытянута по горизонтали, полей сверху и снизу много
      size: 190,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 10,
    },

    // --- Пункт 2: никакого чувства вины. Слова «второе» в озвучке нет,
    // счётчик держится только на эмодзи. ---
    {
      kind: 'emoji',
      note: '«очень важно» (маркера в озвучке нет)',
      from: 21.5,
      to: 22.4,
      char: '2️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«чувство вины»',
      from: 23.4,
      to: 25.4,
      src: 'pictures/cat-pokaysya.jpg',
      width: 350,
      x: 255,
      y: 340,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«находить на проде»',
      from: 27.9,
      to: 28.55,
      char: '🔥',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -6,
    },

    // --- Пункт 3: никому не доверять ---
    {
      kind: 'emoji',
      note: '«3-ье»',
      from: 28.45,
      to: 29.4,
      char: '3️⃣',
      size: 150,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: 8,
    },
    {
      kind: 'emoji',
      note: '«никому не доверять»',
      from: 30.65,
      to: 31.9,
      char: '🤨',
      size: 165,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: 9,
    },
    {
      kind: 'emoji',
      note: '«купили ему игрушку»',
      from: 34.65,
      to: 35.9,
      char: '🎁',
      size: 170,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -8,
    },
    {
      kind: 'meme',
      note: '«и потом не купите её»',
      from: 38.15,
      to: 39.45,
      src: 'pictures/boy-crying.jpg',
      width: 580,
      x: 750,
      y: 320,
      rotate: -4,
    },

    // --- Финал: идеальный тестировщик и баг на родителей ---
    {
      kind: 'meme',
      note: '«идеальный тестировщик»',
      from: 49.15,
      to: 50.7,
      src: 'pictures/cat-laptop.jpg',
      width: 400,
      x: 270,
      y: 330,
      rotate: -5,
    },
    {
      kind: 'emoji',
      note: '«заведёт на вас баг-репорт»',
      from: 53.15,
      to: 54.2,
      char: '🐛',
      size: 190,
      x: ACCENT_X,
      y: ACCENT_Y,
      rotate: -10,
    },
    {
      kind: 'emoji',
      note: '«подписывайся»',
      from: 55.15,
      to: 56.6,
      char: '🔔',
      size: 165,
      x: COUNTER_X,
      y: COUNTER_Y,
      rotate: -8,
    },
  ],
};
