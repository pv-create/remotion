import type {Episode} from '../../shared/reel/types';

// Геометрия снята по measure/frames.jpg и полным кадрам с сеткой, см. notes.md.
// Пословная карта — measure/subtitles.jpg (SUB_Y=1400, ячейка полсекунды),
// снята со второго экспорта source/0918b.mp4: в первом автор перепутал два
// блока третьего пункта (заключение шло до кейсов Kafka). Первые 48 с у
// экспортов совпадают покадрово, дальше хвост переставлен. script.txt —
// расшифровка первого экспорта, порядок хвоста там старый.
//
// Обучалка: смысл несут перебивки `kind: 'cut'`. Под выпуск написаны три
// схемы (src/shared/cuts/components/): Flow — поток по ярусам, Queue —
// очередь с ACK, Log — лог с offset. Кейсы «где что использовать» идут на
// голове с логотипами, а не списком: перебивка показывает механику, а не
// подписывает термин. Резюме «если коротко» — два коротких повтора схем
// после кейсов Kafka, перед CTA.
//
// Звук: у брокеров разный характер. RabbitMQ — коммутатор: серия щелчков,
// когда exchange разводит сообщения, и «галочка» на ACK. Kafka — лента:
// один прямой вуш в партицию, вуш назад на перемотке, щелчки на повторе.
// Плюс счётчики «первое/второе/третье» и уведомление на Telegram, как в
// прошлых выпусках. Восемь на 84 с — ровно потолок линта.

// В начале — 41 кадр девушки «она 10/10 но…» из выпуска Kafka, склеен с
// оригиналом в прокси 0918b_hook_h264.mp4. Все тайминги ниже — по пословной
// карте оригинала плюс HOOK; карта в measure/ снята без хука.
const HOOK = 41 / 30;

// Одиночные эмодзи-акценты — справа от головы, на уровне бровей.
const SIDE_X = 900;
const SIDE_Y = 620;

const CLICK = 'sfx/click.mp3';

export const kafkaRabbit: Episode = {
  id: 'KafkaRabbit',
  videoSrc: 'episodes/kafka_rabbit/0918b_hook_h264.mp4',
  durationInFrames: 2526,
  geometry: {
    hairTop: 350,
    eyes: 770,
    chin: 1120,
    subtitleTop: 1460,
    headLeft: 250,
    headRight: 790,
  },
  overlays: [
    // --- «Первое — маршрутизация» --------------------------------------------
    {
      kind: 'emoji',
      note: '«1-ое» — счётчик',
      from: HOOK + 4.0,
      to: HOOK + 5.4,
      char: '1️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },
    {kind: 'sfx', note: 'щелчок на «1-ое»', from: HOOK + 4.0, to: HOOK + 4.3, src: CLICK, volume: 0.75},

    // --- Перебивка 1. RabbitMQ: producer шлёт в exchange, тот думает и
    // разводит по очередям. Первое сообщение показывает путь с остановкой
    // в exchange, потом на «гибкую маршрутизацию» три уходят пачкой. ---
    {
      kind: 'cut',
      note: 'маршрутизация RabbitMQ: exchange разводит по очередям',
      from: HOOK + 6.9,
      to: HOOK + 19.0,
      spec: {
        kicker: 'ОТЛИЧИЕ 1 · МАРШРУТИЗАЦИЯ',
        badge: 'RABBITMQ',
        title: 'EXCHANGE ВЫБИРАЕТ ОЧЕРЕДЬ',
        titleSize: 96,
        tone: 'accent',
        flow: {
          tiers: [
            {nodes: ['PRODUCER']},
            {nodes: ['EXCHANGE']},
            {nodes: ['QUEUE A', 'QUEUE B', 'QUEUE C'], queue: true},
          ],
          steps: [
            {at: 0, open: [1, 0, 0]},
            // «в эксчейндж»
            {at: 45, open: [1, 1, 0]},
            // «в какую очередь или очереди»
            {at: 108, open: [1, 1, 3]},
          ],
          packets: [
            // «а тот уже решает» — сообщение стоит в exchange две секунды
            {at: 42, route: [0, 0, 0], dwell: 60},
            // «гибкую маршрутизацию» — пачка в три очереди, под серию щелчков
            {at: 262, route: [0, 0, 1], dwell: 0},
            {at: 268, route: [0, 0, 2], dwell: 0},
            {at: 274, route: [0, 0, 0], dwell: 0},
          ],
        },
        // «в зависимости от типа exchange» — названия типов, без объяснения
        sticker: {text: 'direct · topic · fanout', tone: 'accent', tilt: -3, at: 243},
        captions: [
          {at: 0, until: 78, text: 'Producer отправляет сообщение в exchange'},
          {at: 78, until: 225, text: 'Exchange решает, в какую очередь оно попадёт'},
          {at: 225, until: 363, text: 'Правила маршрутизации зависят от типа exchange'},
        ],
      },
    },
    // посадка пачки — кадр 320 перебивки; удар серии на 0.15 с файла
    {kind: 'sfx', note: 'серия щелчков — пачка сообщений разлетелась по очередям', from: HOOK + 17.55, to: HOOK + 18.05, src: 'sfx/clicks.wav', startFrom: 0.15, volume: 0.75},

    // --- Перебивка 2. Kafka: между producer и топиком никого, партицию
    // выбирает ключ, группы читают топик. Стык с первой без головы —
    // «трансформация» из сценария сделана сменой бейджа. ---
    {
      kind: 'cut',
      note: 'маршрутизация Kafka: партицию выбирает ключ, группы читают',
      from: HOOK + 19.0,
      to: HOOK + 29.0,
      spec: {
        kicker: 'ОТЛИЧИЕ 1 · МАРШРУТИЗАЦИЯ',
        badge: 'KAFKA',
        title: 'ПАРТИЦИЮ ВЫБИРАЕТ КЛЮЧ',
        titleSize: 96,
        tone: 'accent',
        flow: {
          tiers: [
            {nodes: ['PRODUCER']},
            {frame: 'TOPIC', nodes: ['P0', 'P1', 'P2'], queue: true},
            {nodes: ['CONSUMER GROUP A', 'CONSUMER GROUP B']},
          ],
          steps: [
            // «брокер ничего не решает» — producer и топик сразу, exchange между ними нет
            {at: 0, open: [1, 3, 0]},
            // «группа консьюмеров»
            {at: 222, open: [1, 3, 2]},
            // «читает уже нужные им топики»
            {at: 252, open: [1, 3, 2], reading: [0, 1]},
          ],
          packets: [
            // «продюсер сам пишет сообщение» — под цифровой вуш
            {at: 52, route: [0, 1]},
            // «а в какую партицию он попадёт, зависит от его ключа»
            {at: 128, route: [0, 0]},
            {at: 160, route: [0, 2]},
          ],
        },
        sticker: {text: 'партицию выбирает ключ', tone: 'accent', tilt: 3, at: 180},
        captions: [
          {at: 0, until: 60, text: 'Брокер ничего не решает'},
          {at: 60, until: 126, text: 'Producer сам пишет события в topic'},
          {at: 126, until: 222, text: 'Партицию выбирает ключ сообщения'},
          {at: 222, until: 300, text: 'Consumer groups читают топик'},
        ],
      },
    },
    // посадка первого сообщения в партицию — кадр 86 перебивки (21.87 с);
    // у вуша пик на 0.46 с, поэтому from на 0.46 раньше, а не startFrom
    {kind: 'sfx', note: 'цифровой вуш — сообщение легло в партицию', from: HOOK + 21.41, to: HOOK + 22.9, src: 'sfx/whoosh-digital.wav', volume: 0.9},

    // --- «Второе — хранение» -------------------------------------------------
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

    // --- Перебивка 3. RabbitMQ: сообщение ушло консьюмеру, ACK, и его нет. ---
    {
      kind: 'cut',
      note: 'хранение RabbitMQ: ACK — и сообщения нет',
      from: HOOK + 32.0,
      to: HOOK + 35.6,
      spec: {
        kicker: 'ОТЛИЧИЕ 2 · ХРАНЕНИЕ',
        badge: 'RABBITMQ',
        title: 'ACK И СООБЩЕНИЯ НЕТ',
        titleSize: 96,
        tone: 'accent',
        // «сообщения удаляются сразу же после прочтения»
        queue: {cells: ['A', 'B', 'C', 'D'], consumer: 'CONSUMER', deliverAt: 14, ackAt: 40, dropAt: 52},
        captions: [
          {at: 0, until: 58, text: 'Consumer обработал сообщение: ACK'},
          {at: 58, until: 108, text: 'Сообщение удаляется из очереди'},
        ],
      },
    },
    {kind: 'sfx', note: '«галочка» на ACK', from: HOOK + 33.33, to: HOOK + 33.63, src: 'sfx/notify-2.wav', volume: 0.75},

    // --- Перебивка 4. Kafka: прочитанное остаётся, offset можно отмотать. ---
    {
      kind: 'cut',
      note: 'хранение Kafka: retention, offset, перечитать',
      from: HOOK + 35.6,
      to: HOOK + 48.0,
      spec: {
        kicker: 'ОТЛИЧИЕ 2 · ХРАНЕНИЕ',
        badge: 'KAFKA',
        title: 'СОБЫТИЯ ОСТАЮТСЯ',
        titleSize: 96,
        tone: 'accent',
        log: {
          cells: 7,
          // «сообщения хранятся» — консьюмер проходит по логу
          readAt: 24,
          step: 7,
          // «согласно retention policy»
          retentionAt: 72,
          // «хранит свой offset»
          offsetAt: 267,
          // «может вернуться»
          rewindAt: 312,
          rewindTo: 4,
          // «и перечитать»
          replayAt: 340,
        },
        // «вне зависимости от того, было оно прочтено или нет»
        sticker: {text: 'остаются на месте', tone: 'accent', tilt: -3, at: 104},
        captions: [
          {at: 0, until: 96, text: 'События хранятся по retention policy'},
          {at: 96, until: 204, text: 'Прочитаны или нет, остаются на месте'},
          {at: 204, until: 300, text: 'Consumer хранит свой offset'},
          {at: 300, until: 372, text: 'Можно вернуться и перечитать'},
        ],
      },
    },
    // перемотка и повтор — один жест, поэтому два звука ближе 3 с
    {kind: 'sfx', note: 'вуш назад — offset откатился на 4', from: HOOK + 46.0, to: HOOK + 46.3, src: 'sfx/whoosh-short-2.wav', volume: 1.0},
    {kind: 'sfx', note: 'щелчки — события 5–7 читаются заново', from: HOOK + 46.93, to: HOOK + 47.45, src: 'sfx/clicks-2.wav', startFrom: 0.25, volume: 0.75},

    // --- «Третье — когда и что использовать» ---------------------------------
    {
      kind: 'emoji',
      note: '«3-ье» — счётчик',
      from: HOOK + 48.0,
      to: HOOK + 49.4,
      char: '3️⃣',
      size: 170,
      x: SIDE_X,
      y: SIDE_Y,
      rotate: 6,
    },
    // щелчка на «3-ье» нет: через секунду после щелчков повтора он слипался бы с ними
    {
      kind: 'meme',
      note: '«rabbitmq отлично подходит» — кролик на весь кейс',
      from: HOOK + 50.0,
      to: HOOK + 57.6,
      src: 'pictures/logos/rabbitmq.png',
      width: 260,
      x: 930,
      y: 590,
      rotate: -4,
    },

    {
      kind: 'meme',
      note: '«Кафка подходит» — лого на весь кейс',
      from: HOOK + 58.2,
      to: HOOK + 68.0,
      src: 'pictures/logos/kafka.jpg',
      width: 260,
      x: 930,
      y: 640,
      rotate: 3,
    },

    // --- Резюме «если коротко»: обе схемы ещё раз, по три секунды. ---
    {
      kind: 'cut',
      note: 'если коротко: RabbitMQ — доставка и маршрутизация',
      from: HOOK + 68.8,
      to: HOOK + 71.6,
      spec: {
        kicker: 'ЕСЛИ КОРОТКО',
        badge: 'RABBITMQ',
        title: 'ДОСТАВКА И МАРШРУТИЗАЦИЯ',
        titleSize: 96,
        tone: 'accent',
        flow: {
          tiers: [
            {nodes: ['PRODUCER']},
            {nodes: ['EXCHANGE']},
            {nodes: ['QUEUE A', 'QUEUE B', 'QUEUE C'], queue: true, cells: [2, 1, 2]},
          ],
          steps: [{at: 0, open: [1, 1, 3]}],
          packets: [{at: 6, route: [0, 0, 1]}],
          dwell: 6,
        },
        captions: [{at: 0, until: 84, text: 'RabbitMQ: доставка и маршрутизация сообщений'}],
      },
    },
    {
      kind: 'cut',
      note: 'если коротко: Kafka — хранение потока событий',
      from: HOOK + 71.6,
      to: HOOK + 74.8,
      spec: {
        kicker: 'ЕСЛИ КОРОТКО',
        badge: 'KAFKA',
        title: 'ХРАНЕНИЕ ПОТОКА СОБЫТИЙ',
        titleSize: 96,
        tone: 'accent',
        log: {cells: 7, readAt: 10, step: 7, retentionAt: 10, offsetAt: 40},
        captions: [{at: 0, until: 96, text: 'Kafka: хранение и обработка потоков событий'}],
      },
    },

    // --- CTA: карточка канала до конца, как в «Резюме». ---
    {
      kind: 'meme',
      note: '«Telegram-канале» — карточка канала, держится до конца',
      from: HOOK + 75.5,
      to: HOOK + 82.8,
      src: 'pictures/tg-mathkras.jpg',
      // 650 — предел: карточка поднята из скриншота 433 px, шире мылит
      width: 650,
      x: 740,
      y: 400,
      rotate: 4,
    },
    {
      kind: 'emoji',
      note: '«Telegram-канале»',
      from: HOOK + 75.5,
      to: HOOK + 77.0,
      char: '✈️',
      size: 150,
      x: 150,
      y: 820,
      rotate: -10,
    },
    {kind: 'sfx', note: 'уведомление на «Телеграм»', from: HOOK + 75.5, to: HOOK + 76.9, src: 'sfx/notify.wav', volume: 0.6},
    {
      kind: 'emoji',
      note: '«подписывайся»',
      from: HOOK + 81.0,
      to: HOOK + 82.5,
      char: '🔔',
      size: 165,
      x: 150,
      y: 620,
      rotate: -8,
    },
  ],
};
