import type {Episode} from '../../shared/reel/types';

// Геометрия, пословная карта и цепочка прокси — notes.md (секунды оригинала).
//
// Ролик-мост к мок-собесам: «три вещи, которые помогли на собесах». Голова
// крупная, над волосами ~240 px — карточкам места нет, графика живёт
// перебивками на полный экран, на лице только эмодзи справа.
// Хук (accent, `docs`): те же собесы, офферов вдвое больше. Без цифр — автор
// просил просто ×2.
// Первое (accent, `docs`): ты → интервьюер → фидбек, волнение падает.
// Второе (accent, `docs`): пул вопросов по языкам, в C# — сборщик мусора и
// асинхронность; дедлок на .Result в речи не назван, перебивка добирает.
// Третье и CTA — на лице.
//
// Звук: клики на плашках (просьба автора), дедлок, уведомление на Telegram.
// Уведомление на втором оффере и аплодисменты на кубке автор убрал.

// Вся запись ускорена в 1.1 раза прямо в прокси (setpts/atempo), хука нет.
const SPEED = 1.1;
const T = (s: number) => s / SPEED;
/** Кадр внутри перебивки: слово на секунде s оригинала, перебивка с start. */
const F = (s: number, start: number) => Math.round(((s - start) / SPEED) * 30);

// Эмодзи — справа от головы (до края 300 px), над бровями (660).
const SIDE_X = 930;
const SIDE_Y = 520;

// Перебивки: секунды оригинала начала и конца. Начала слов сняты по кадрам
// с шагом 0.1 с.
const CUT0 = 2.3; // «конверсию»
const CUT0_END = 4.95; // после «раза», до «1-ое» (5.0)
const CUT1 = 6.2; // «мок»
const CUT1_END = 18.45; // после «кодинга», до «2-ое» (18.5)
const DESIGN = 16.7; // «систем»
const CODING = 17.7; // «лайф»
const CUT2 = 19.5; // «подготовиться»
const CUT2_END = 31.25; // после «асинхронностью», до «3-ье» (31.3)

export const mokSobes: Episode = {
  id: 'MokSobes',
  videoSrc: 'episodes/mok_sobes/1002_speed11_h264.mp4',
  durationInFrames: 1277,
  geometry: {
    hairTop: 240,
    eyes: 720,
    chin: 1040,
    subtitleTop: 1360,
    headLeft: 160,
    headRight: 780,
  },
  overlays: [
    // --- хук ---------------------------------------------------------------------
    // Перебивка 0. Четыре собеса, под ними оффер, на «в два раза» — второй.
    {
      kind: 'cut',
      note: 'хук: те же собесы — офферов вдвое больше',
      from: T(CUT0),
      to: T(CUT0_END),
      spec: {
        kicker: 'ТРИ ВЕЩИ',
        badge: 'КОНВЕРСИЯ',
        title: 'ОФФЕРОВ ВДВОЕ',
        titleSize: 96,
        tone: 'accent',
        docs: {
          rows: 2,
          items: [
            // «собеседований» — 3.0, каскадом
            {id: 's1', kind: 'node', label: 'СОБЕС', x: 0.125, row: 0, w: 0.22, at: F(3.0, CUT0)},
            {id: 's2', kind: 'node', label: 'СОБЕС', x: 0.375, row: 0, w: 0.22, at: F(3.0, CUT0) + 3},
            {id: 's3', kind: 'node', label: 'СОБЕС', x: 0.625, row: 0, w: 0.22, at: F(3.0, CUT0) + 6},
            {id: 's4', kind: 'node', label: 'СОБЕС', x: 0.875, row: 0, w: 0.22, at: F(3.0, CUT0) + 9},
            // «офферы» — 4.0, «в 2 раза» — 4.5
            {id: 'o1', kind: 'node', label: 'ОФФЕР', x: 0.375, row: 1, w: 0.22, at: F(4.0, CUT0)},
            {id: 'o2', kind: 'node', label: 'ОФФЕР', x: 0.625, row: 1, w: 0.22, lit: true, at: F(4.5, CUT0)},
          ],
          arrows: [
            {from: 's2', to: 'o1', at: F(4.0, CUT0)},
            {from: 's3', to: 'o2', at: F(4.5, CUT0)},
          ],
        },
        captions: [
          {at: 0, until: F(3.6, CUT0), text: 'Конверсия собесов в офферы'},
          {at: F(3.6, CUT0), until: F(CUT0_END, CUT0), text: 'выросла в два раза'},
        ],
      },
    },

    // --- «Первое — мок-собесы» ---------------------------------------------------
    {
      kind: 'emoji',
      note: '«1-ое» — счётчик',
      from: T(5.0),
      to: T(6.15),
      char: '1️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },

    // Перебивка 1. Ты идёшь к интервьюеру, волнение падает, фидбек называет,
    // где плывёшь. На «систем-дизайна» и «лайф-кодинга» — две плашки,
    // по-английски (просьба автора), с кликом мыши. Плашки — залитые узлы, а
    // не стикеры: стикер в кадре один (§4 хендоффа).
    {
      kind: 'cut',
      note: 'мок-собес: интервьюер, волнение падает, фидбек',
      from: T(CUT1),
      to: T(CUT1_END),
      spec: {
        kicker: 'ПЕРВОЕ · РЕПЕТИЦИЯ',
        badge: 'ФИДБЕК',
        title: 'МОК-СОБЕС',
        tone: 'accent',
        docs: {
          rows: 3,
          items: [
            {id: 'you', kind: 'node', label: 'ТЫ', x: 0.2, row: 0, w: 0.28, at: 0},
            // «собесов» — 7.0
            {id: 'interviewer', kind: 'node', label: 'ИНТЕРВЬЮЕР', x: 0.7, row: 0, w: 0.5, at: F(7.0, CUT1)},
            // «обратную связь» — 11.5
            {
              id: 'feedback',
              kind: 'doc',
              label: 'ФИДБЕК',
              x: 0.5,
              row: 1,
              w: 0.72,
              at: F(11.5, CUT1),
              lines: ['system design: плывёшь', 'live coding:   молчишь'],
            },
            // «систем» — 16.7, «лайф» — 17.7
            {id: 'sd', kind: 'node', label: 'SYSTEM DESIGN', x: 0.26, row: 2, w: 0.46, lit: true, at: F(DESIGN, CUT1)},
            {id: 'lc', kind: 'node', label: 'LIVE CODING', x: 0.74, row: 2, w: 0.46, lit: true, at: F(CODING, CUT1)},
          ],
          arrows: [
            {from: 'you', to: 'interviewer', at: F(7.0, CUT1) + 6},
            {from: 'interviewer', to: 'feedback', at: F(11.5, CUT1) + 6},
          ],
        },
        // «снять волнение» — 9.0
        meter: {label: 'ВОЛНЕНИЕ', from: 85, to: 20, tone: 'accent', at: F(9.0, CUT1)},
        captions: [
          {at: 0, until: F(8.0, CUT1), text: 'Первое — мок-собесы'},
          {at: F(8.0, CUT1), until: F(10.0, CUT1), text: 'Лучший способ снять волнение'},
          {at: F(10.0, CUT1), until: F(12.5, CUT1), text: 'и получить обратную связь'},
          {at: F(12.5, CUT1), until: F(14.0, CUT1), text: 'от человека с опытом'},
          {at: F(14.0, CUT1), until: F(16.5, CUT1), text: 'Мне это помогло пройти'},
          {at: F(16.5, CUT1), until: F(CUT1_END, CUT1), text: 'system design и лайв-кодинг'},
        ],
      },
    },
    // лёгкий клик мыши на каждую плашку — просьба автора, два подряд под
    // перечисление, как писк в sqrs
    ...[DESIGN, CODING].map((s) => ({
      kind: 'sfx' as const,
      note: `клик — плашка на ${s}`,
      from: T(CUT1) + F(s, CUT1) / 30,
      to: T(CUT1) + F(s, CUT1) / 30 + 0.2,
      src: 'sfx/mouse-click.wav',
      volume: 0.6,
    })),

    // --- «Второе — типовые вопросы» ----------------------------------------------
    {
      kind: 'emoji',
      note: '«2-ое» — счётчик',
      from: T(18.5),
      to: T(19.45),
      char: '2️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: -6,
    },

    // Перебивка 2. В каждом языке свой пул вопросов; в C# — сборщик мусора и
    // асинхронность. Поколения GC и порог LOH (85 000 байт) — по документации
    // .NET; .Result в UI-потоке — классический дедлок на SynchronizationContext.
    {
      kind: 'cut',
      note: 'типовые вопросы: языки, в C# — GC и async',
      from: T(CUT2),
      to: T(CUT2_END),
      spec: {
        kicker: 'ВТОРОЕ · ТИПОВЫЕ ВОПРОСЫ',
        badge: 'C#',
        title: 'ЛЮБИМЫЕ ВОПРОСЫ',
        titleSize: 88,
        tone: 'accent',
        docs: {
          rows: 2,
          items: [
            // «в каждом языке» — 21.5, каскадом
            {id: 'cs', kind: 'node', label: 'C#', x: 0.2, row: 0, w: 0.26, at: F(21.5, CUT2)},
            {id: 'go', kind: 'node', label: 'GO', x: 0.5, row: 0, w: 0.26, at: F(21.5, CUT2) + 3},
            {id: 'java', kind: 'node', label: 'JAVA', x: 0.8, row: 0, w: 0.26, at: F(21.5, CUT2) + 6},
            // «гарбидж-коллектора» — 28.5
            {
              id: 'gc',
              kind: 'doc',
              label: 'GC',
              x: 0.24,
              row: 1,
              w: 0.44,
              at: F(28.5, CUT2),
              lines: ['gen 0 → gen 1', 'gen 1 → gen 2', 'LOH: > 85 KB'],
            },
            // «асинхронностью» — 30.3
            {
              id: 'async',
              kind: 'doc',
              label: 'ASYNC',
              x: 0.76,
              row: 1,
              w: 0.44,
              at: F(30.3, CUT2),
              lines: ['task.Result;', '// дедлок'],
            },
          ],
          arrows: [
            {from: 'cs', to: 'gc', at: F(28.5, CUT2) + 6},
            {from: 'cs', to: 'async', at: F(30.3, CUT2) + 6},
          ],
        },
        // «любят спрашивать» — 24.5
        sticker: {text: 'ЛЮБЯТ СПРАШИВАТЬ', tone: 'accent', tilt: 3, at: F(24.5, CUT2)},
        captions: [
          {at: 0, until: F(21.5, CUT2), text: 'Второе — типовые вопросы'},
          {at: F(21.5, CUT2), until: F(24.5, CUT2), text: 'В каждом языке есть пул вопросов'},
          {at: F(24.5, CUT2), until: F(26.5, CUT2), text: 'которые любят спрашивать'},
          {at: F(26.5, CUT2), until: F(28.4, CUT2), text: 'Например, в C# —'},
          {at: F(28.4, CUT2), until: F(30.2, CUT2), text: 'сборщик мусора'},
          {at: F(30.2, CUT2), until: F(CUT2_END, CUT2), text: 'и асинхронность'},
        ],
      },
    },
    // документ ASYNC встаёт за 3 кадра, удар error-2 на 0.15 с файла
    {kind: 'sfx', note: 'ошибка — дедлок', from: T(CUT2) + (F(30.3, CUT2) + 3) / 30 - 0.15, to: T(CUT2) + (F(30.3, CUT2) + 3) / 30 + 0.45, src: 'sfx/error-2.wav', volume: 0.75},

    // --- «Третье — практика» -----------------------------------------------------
    {
      kind: 'emoji',
      note: '«3-ье» — счётчик',
      from: T(31.3),
      to: T(32.6),
      char: '3️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },
    {
      kind: 'emoji',
      note: '«одни соревнования»',
      from: T(34.8),
      to: T(36.4),
      char: '🏆',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«за годы тренировок»',
      from: T(38.0),
      to: T(39.4),
      char: '🏋️',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },

    // --- CTA ---------------------------------------------------------------------
    // Справа от головы карточка влезает только в 300 px и не читается, над
    // головой места нет. В концовке подбородок ~1040, субтитры с 1360 —
    // между ними 320 px, туда карточка 470×297 на грудь; микрофон ниже полосы.
    {
      kind: 'meme',
      note: '«в моём Телеграм-канале» — карточка канала на груди, до конца',
      from: T(43.5),
      to: 1277 / 30,
      src: 'pictures/tg-2.png',
      width: 470,
      x: 540,
      y: 1200,
      rotate: 0,
    },
    {kind: 'sfx', note: 'уведомление на «Телеграм»', from: T(43.5), to: T(43.5) + 0.3, src: 'sfx/notify-4.wav', volume: 0.75},
  ],
};
