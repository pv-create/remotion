import type {Episode} from '../../shared/reel/types';

// Геометрия снята по measure/frames.jpg и двум полным кадрам с сеткой (1 и
// 55 с), см. notes.md. Пословная карта — measure/subtitles.jpg (SUB_Y=1400,
// ячейка полсекунды), секунды оригинала без хука.
//
// Обучалка. Первое отличие (контракт и формат) — три перебивки новой схемы
// `docs` в src/shared/cuts/: документы с моноширинными строками и узлы.
// REST: клиент шлёт серверу JSON, описание API — отдельный пунктирный
// документ с наклейкой «необязательно». gRPC: proto-файл сверху, из него
// генерируются два узла кода; потом JSON против бинарного блока Protocol
// Buffers со шкалой размера. Blender-карточки, что стояли здесь в первом
// рендере, автор отверг («тухло»), заготовки лежат в blender/ как история.
// Второе (общение) — схема `rpc`: клиент и сервер друг напротив друга,
// запрос и ответ по двум полосам; у gRPC вокруг полос рамка HTTP/2 и режимы
// UNARY → SERVER STREAMING → BIDIRECTIONAL.
// Третье (где что) — на голове: эмодзи и логотип gRPC, списком не делаем.
// Резюме «если коротко» автор в записи не читал, CTA — карточка канала.
//
// На 18.0–19.0 с автор вклеил в кадр правку «GRPC*» (сказал «в REST наоборот»):
// она целиком под перебивкой gRPC, бейдж перебивки и субтитры говорят то же.
//
// Звук: семь на 72 с. В первом отличии вуш со щелчком на JSON, который встал
// между клиентом и сервером, и серия щелчков на сгенерированный код. Во
// втором — «галочка» на пришедший ответ REST и серия щелчков на server
// streaming. Плюс счётчики «первое/второе» и уведомление на Telegram. На
// «3-ье» щелчка нет — через две секунды после серии он слипался бы с ней.
// Громкости выше описи: звук здесь всегда под словом, первый рендер показал,
// что на рекомендованных он не поднимается над речью.

// В начале — 41 кадр девушки «она 10/10 но…» из выпуска Kafka, склеен с
// оригиналом в прокси 0920_hook_h264.mp4 (хук поднят на 3.6 dB). Все тайминги
// ниже — по пословной карте оригинала плюс HOOK.
const HOOK = 41 / 30;

// Одиночные эмодзи-акценты — справа от головы, на уровне бровей.
const SIDE_X = 900;
const SIDE_Y = 620;
// Слева от головы — когда справа уже стоит карточка.
const LEFT_X = 150;

const CLICK = 'sfx/click.mp3';

export const grpcRest: Episode = {
  id: 'GrpcRest',
  videoSrc: 'episodes/grpc_rest/0920_hook_h264.mp4',
  durationInFrames: 2165,
  geometry: {
    hairTop: 320,
    eyes: 800,
    chin: 1170,
    subtitleTop: 1470,
    headLeft: 230,
    headRight: 770,
  },
  overlays: [
    // --- «Первое — как описывается API и передаются данные» ------------------
    {
      kind: 'emoji',
      note: '«1-ое» — счётчик',
      from: HOOK + 5.0,
      to: HOOK + 6.4,
      char: '1️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },
    {kind: 'sfx', note: 'щелчок на «1-ое»', from: HOOK + 5.0, to: HOOK + 5.3, src: CLICK, volume: 0.75},

    // Перебивка 1. REST: клиент шлёт серверу JSON; описание API — отдельный
    // документ пунктиром, живёт отдельно и необязателен.
    {
      kind: 'cut',
      note: 'контракт REST: данные в JSON, описание отдельно',
      from: HOOK + 8.5,
      to: HOOK + 17.9,
      spec: {
        kicker: 'ОТЛИЧИЕ 1 · КОНТРАКТ',
        badge: 'REST',
        title: 'ДАННЫЕ В JSON',
        titleSize: 96,
        tone: 'accent',
        docs: {
          rows: 2,
          items: [
            {id: 'client', kind: 'node', label: 'CLIENT', x: 0.11, row: 0, w: 0.22, at: 0},
            {id: 'server', kind: 'node', label: 'SERVER', x: 0.89, row: 0, w: 0.22, at: 3},
            // «гоняются в json» — 10.5
            {
              id: 'json',
              kind: 'doc',
              label: 'POST /users',
              x: 0.5,
              row: 0,
              w: 0.34,
              at: 54,
              lines: ['{', '  "name": "Alex",', '  "age": 25', '}'],
            },
            // «описание живёт отдельно, например в OpenAPI» — 12.5
            {
              id: 'spec',
              kind: 'doc',
              label: 'openapi.yaml',
              x: 0.5,
              row: 1,
              w: 0.34,
              at: 120,
              dashed: true,
              lines: ['paths:', '  /users:', '    post: …'],
            },
          ],
          arrows: [
            {from: 'client', to: 'json', at: 54},
            {from: 'json', to: 'server', at: 72},
          ],
        },
        // «оно не является обязательным» — 16.0
        sticker: {text: 'необязательно', tone: 'accent', tilt: -3, at: 225},
        captions: [
          {at: 0, until: 54, text: 'REST: клиент и сервер обмениваются данными'},
          {at: 54, until: 120, text: 'Данные чаще всего в JSON'},
          {at: 120, until: 225, text: 'Описание API живёт отдельно: OpenAPI'},
          {at: 225, until: 282, text: 'И оно необязательно'},
        ],
      },
    },
    // JSON встал между клиентом и сервером — кадр 54 перебивки (10.3 с);
    // вуш начинается до посадки, щелчок на ней
    {kind: 'sfx', note: 'вуш со щелчком — JSON встал между клиентом и сервером', from: HOOK + 10.2, to: HOOK + 11.1, src: 'sfx/whoosh-click.wav', volume: 0.85},

    // Перебивка 2. gRPC: сначала proto-файл, из него генерируются клиентский
    // и серверный код — два узла, залитые как «только что появились».
    {
      kind: 'cut',
      note: 'контракт gRPC: proto первичен, код генерируется',
      from: HOOK + 17.9,
      to: HOOK + 24.5,
      spec: {
        kicker: 'ОТЛИЧИЕ 1 · КОНТРАКТ',
        badge: 'GRPC',
        title: 'СНАЧАЛА КОНТРАКТ',
        titleSize: 96,
        tone: 'accent',
        docs: {
          rows: 2,
          items: [
            // «сначала пишется контракт в proto-файле» — 19.0–21.0
            {
              id: 'proto',
              kind: 'doc',
              label: 'user.proto',
              x: 0.5,
              row: 0,
              w: 0.5,
              at: 33,
              lines: ['service UserService {', '  rpc GetUser (UserRequest)', '    returns (User);', '}'],
            },
            // «генерируется клиентский» — 23.0, «серверный» — 23.5
            {id: 'client', kind: 'node', label: 'CLIENT CODE', x: 0.25, row: 1, w: 0.34, at: 150, lit: true},
            {id: 'server', kind: 'node', label: 'SERVER CODE', x: 0.75, row: 1, w: 0.34, at: 168, lit: true},
          ],
          arrows: [
            // «по нему уже генерируется» — 21.5–22.5
            {from: 'proto', to: 'client', at: 129},
            {from: 'proto', to: 'server', at: 147},
          ],
        },
        captions: [
          {at: 0, until: 33, text: 'В gRPC наоборот: сначала контракт'},
          {at: 33, until: 129, text: 'Контракт описывают в .proto-файле'},
          {at: 129, until: 198, text: 'По нему генерируется клиентский и серверный код'},
        ],
      },
    },
    // узел клиентского кода встал — кадр 150 перебивки (22.9 с); удар серии на 0.15 с файла
    {kind: 'sfx', note: 'серия щелчков — код сгенерирован', from: HOOK + 22.9, to: HOOK + 23.5, src: 'sfx/clicks.wav', startFrom: 0.15, volume: 0.75},

    // Перебивка 3. Формат: те же два поля в JSON и в Protocol Buffers.
    // {"name":"Alex","age":25} — 24 байта; в protobuf 0A 04 41 6C 65 78 10 19 — 8.
    {
      kind: 'cut',
      note: 'формат gRPC: не JSON, а бинарный Protocol Buffers',
      from: HOOK + 24.5,
      to: HOOK + 28.3,
      spec: {
        kicker: 'ОТЛИЧИЕ 1 · ФОРМАТ',
        badge: 'GRPC',
        title: 'БИНАРНЫЙ ФОРМАТ',
        titleSize: 96,
        tone: 'accent',
        docs: {
          rows: 1,
          items: [
            {
              id: 'json',
              kind: 'doc',
              label: 'JSON · 24 B',
              x: 0.25,
              row: 0,
              w: 0.4,
              at: 6,
              lines: ['{', '  "name": "Alex",', '  "age": 25', '}'],
            },
            // «бинарном формате» — 26.5
            {
              id: 'bin',
              kind: 'doc',
              label: 'protobuf · 8 B',
              x: 0.75,
              row: 0,
              w: 0.4,
              at: 60,
              solid: true,
              lines: ['0A 04 41 6C', '65 78 10 19'],
            },
          ],
          // «не в json, а» — 26.0
          arrows: [{from: 'json', to: 'bin', at: 45}],
        },
        // «protocol buffers» — 27.5: та же запись втрое короче
        meter: {label: 'РАЗМЕР СООБЩЕНИЯ', from: 100, to: 33, tone: 'accent', at: 66},
        captions: [
          {at: 0, until: 45, text: 'Данные передаются не в JSON'},
          {at: 45, until: 114, text: 'А в бинарном Protocol Buffers: те же два поля в 8 байт'},
        ],
      },
    },

    // --- «Второе — как клиент общается с сервером» ---------------------------
    {
      kind: 'emoji',
      note: '«2-ое» — счётчик',
      from: HOOK + 29.0,
      to: HOOK + 30.4,
      char: '2️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: -6,
    },
    {kind: 'sfx', note: 'щелчок на «2-ое»', from: HOOK + 29.0, to: HOOK + 29.3, src: CLICK, volume: 0.75},

    // Перебивка 1. REST: один HTTP-запрос туда, один HTTP-ответ обратно.
    {
      kind: 'cut',
      note: 'общение REST: один запрос — один ответ',
      from: HOOK + 31.5,
      to: HOOK + 37.0,
      spec: {
        kicker: 'ОТЛИЧИЕ 2 · ОБЩЕНИЕ',
        badge: 'REST',
        title: 'ЗАПРОС — ОТВЕТ',
        titleSize: 96,
        tone: 'accent',
        rpc: {
          client: 'CLIENT',
          server: 'SERVER',
          reqLabel: 'HTTP REQUEST',
          resLabel: 'HTTP RESPONSE',
          travel: 24,
          messages: [
            // «один http запрос» — 34.0
            {at: 72, dir: 'req'},
            // «один http ответ» — 35.5
            {at: 126, dir: 'res'},
          ],
        },
        captions: [
          {at: 0, until: 72, text: 'REST: клиент и сервер общаются по HTTP'},
          {at: 72, until: 126, text: 'Один запрос'},
          {at: 126, until: 165, text: 'Один ответ'},
        ],
      },
    },
    // ответ пришёл клиенту — кадр 150 перебивки (36.5 с)
    // 0.9, а не 0.75 как в Kafka: здесь «галочка» попадает прямо на слово «ответ»
    {kind: 'sfx', note: '«галочка» — ответ пришёл', from: HOOK + 36.5, to: HOOK + 36.8, src: 'sfx/notify-2.wav', volume: 0.9},

    // Перебивка 2. gRPC: сначала такой же unary, на «HTTP/2» вокруг полос
    // встаёт рамка соединения, дальше сервер льёт поток, потом оба сразу.
    {
      kind: 'cut',
      note: 'общение gRPC: HTTP/2 и стримы',
      from: HOOK + 37.0,
      to: HOOK + 42.5,
      spec: {
        kicker: 'ОТЛИЧИЕ 2 · ОБЩЕНИЕ',
        badge: 'GRPC',
        title: 'HTTP/2 И СТРИМЫ',
        titleSize: 96,
        tone: 'accent',
        rpc: {
          client: 'CLIENT',
          server: 'SERVER',
          channel: 'HTTP/2',
          // «поверх протокола http/2» — 39.0
          channelAt: 58,
          travel: 18,
          modes: [
            {at: 6, label: 'UNARY'},
            {at: 66, label: 'SERVER STREAMING'},
            // «стримы» — 42.0; поток в обе стороны стартует чуть раньше слова
            {at: 122, label: 'BIDIRECTIONAL'},
          ],
          messages: [
            // unary: запрос и ответ
            {at: 8, dir: 'req'},
            {at: 30, dir: 'res'},
            // server streaming: один запрос, три ответа подряд — под серию щелчков
            {at: 68, dir: 'req'},
            {at: 88, dir: 'res'},
            {at: 94, dir: 'res'},
            {at: 100, dir: 'res'},
            // bidirectional: сообщения в обе стороны вперемешку
            {at: 124, dir: 'req'},
            {at: 128, dir: 'res'},
            {at: 132, dir: 'req'},
            {at: 136, dir: 'res'},
            {at: 140, dir: 'req'},
            {at: 144, dir: 'res'},
          ],
        },
        captions: [
          {at: 0, until: 58, text: 'Обычный запрос-ответ в gRPC тоже есть'},
          {at: 58, until: 122, text: 'HTTP/2: одно соединение, много сообщений'},
          {at: 122, until: 165, text: 'Стримы: поток в обе стороны'},
        ],
      },
    },
    // первый ответ потока пришёл — кадр 106 перебивки (40.53 с); удар серии на 0.15 с файла
    {kind: 'sfx', note: 'серия щелчков — сервер льёт поток', from: HOOK + 40.53, to: HOOK + 41.1, src: 'sfx/clicks.wav', startFrom: 0.15, volume: 0.75},

    // --- «Третье — что и где использовать» -----------------------------------
    {
      kind: 'emoji',
      note: '«3-ье» — счётчик',
      from: HOOK + 42.5,
      to: HOOK + 43.9,
      char: '3️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },
    // щелчка на «3-ье» нет: две секунды после серии щелчков потока
    {
      kind: 'emoji',
      note: '«публичных API»',
      from: HOOK + 45.5,
      to: HOOK + 47.0,
      char: '🌐',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: -6,
    },
    {
      kind: 'emoji',
      note: '«курлом дёрнуть запрос в терминале»',
      from: HOOK + 50.0,
      to: HOOK + 52.5,
      char: '💻',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 5,
    },
    {
      kind: 'meme',
      note: '«gRPC лучше использовать для внутреннего…» — лого на весь кейс',
      from: HOOK + 53.5,
      to: HOOK + 60.5,
      src: 'pictures/logos/grpc.jpg',
      width: 280,
      x: 920,
      y: 600,
      rotate: -4,
    },
    {
      kind: 'emoji',
      note: '«минимальная задержка» — слева, справа лого',
      from: HOOK + 59.0,
      to: HOOK + 60.5,
      char: '⚡',
      size: 170,
      x: LEFT_X,
      y: SIDE_Y,
      rotate: -8,
    },

    // --- CTA: карточка канала до конца, как в Kafka. ---
    {
      kind: 'meme',
      note: '«в своём Telegram-канале» — карточка канала, держится до конца',
      from: HOOK + 66.3,
      to: HOOK + 70.7,
      src: 'pictures/tg-mathkras.jpg',
      // 650 — предел: карточка поднята из скриншота 433 px, шире мылит
      width: 650,
      x: 740,
      y: 400,
      rotate: 4,
    },
    {
      kind: 'meme',
      note: '«Telegram-канале» — лого Telegram слева, справа карточка канала',
      from: HOOK + 66.3,
      to: HOOK + 67.8,
      src: 'pictures/logos/telegram.jpg',
      width: 200,
      x: LEFT_X,
      y: 600,
      rotate: -8,
    },
    {kind: 'sfx', note: 'уведомление на «Telegram»', from: HOOK + 66.3, to: HOOK + 67.7, src: 'sfx/notify.wav', volume: 0.6},
    {
      kind: 'emoji',
      note: '«подписывайся»',
      from: HOOK + 69.0,
      to: HOOK + 70.5,
      char: '🔔',
      size: 165,
      x: LEFT_X,
      y: SIDE_Y,
      rotate: -8,
    },
  ],
};
