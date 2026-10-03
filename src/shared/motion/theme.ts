/**
 * Motion-система «BACKEND ЗА 30 СЕКУНД» — токены.
 * Единственный источник значений. Никаких литералов в компонентах.
 *
 * Перенесено из design_handoff_motion_system/theme.ts без изменения значений.
 * Добавлена только загрузка шрифтов: в вебе Montserrat и IBM Plex Sans
 * не появятся сами, а система требует именно их.
 */

import {Easing, spring, type SpringConfig} from 'remotion';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadPlex} from '@remotion/google-fonts/IBMPlexSans';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';

const montserrat = loadMontserrat().fontFamily;
const plex = loadPlex().fontFamily;
const plexMono = loadPlexMono().fontFamily;

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 900;

export const color = {
  paper: '#F1EDE3',
  ink: '#16130F',
  accent: '#DFA94C',
  alarm: '#C4552F',
  muted: '#9A9287',
  line: '#CFC7B4',
} as const;

export const safe = {
  side: 92,
  top: 200,
  bottom: 180,
  /** Зона субтитров: нижние 16% кадра. */
  captions: Math.round(HEIGHT * 0.16),
} as const;

export const grid = {step: 24, opacity: 0.05} as const;

/**
 * ОТКЛОНЕНИЕ ОТ ХЕНДОФФА. В пакете нет моноширинного шрифта, а перебивки с
 * документами (JSON, .proto в grpc_rest) без него не читаются как код.
 * Взят IBM Plex Mono — пара к IBM Plex Sans из системы; кегль `type.code`
 * ниже lead, чтобы четыре строки влезали в карточку схемы.
 */
export const font = {
  display: montserrat,
  body: plex,
  mono: plexMono,
} as const;

export const type = {
  kicker: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: 30,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: color.muted,
  },
  title: {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: 112,
    lineHeight: 0.92,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },
  lead: {fontFamily: font.body, fontWeight: 400, fontSize: 42, lineHeight: 1.35},
  /** см. отклонение у `font.mono` */
  code: {fontFamily: font.mono, fontWeight: 500, fontSize: 24, lineHeight: 1.35},
  caption: {
    fontFamily: font.display,
    fontWeight: 800,
    fontSize: 46,
    lineHeight: 1.25,
    textAlign: 'center',
  },
  readout: {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: 64,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  dataLabel: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: 26,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: color.muted,
  },
} as const;

/**
 * ОТКЛОНЕНИЕ ОТ ХЕНДОФФА.
 * В `theme.ts` пакета блок `shape` задан в половинном масштабе: типографика
 * там помечена «@1080», а формы, судя по эталонному кадру, мерились при 540.
 * Замер по reference/frame-autoscaling.png: слот ~149 px при токене 74
 * (отношение 2.01), метр ~35 px при токене 16 (2.19).
 * Без множителя слоты в кадре 1080 превращаются в нечитаемые квадратики.
 * Вернуть как было — поставить 1.
 */
const SHAPE_SCALE = 2;

export const shape = {
  slot: {
    size: 74 * SHAPE_SCALE,
    radius: 12 * SHAPE_SCALE,
    border: 2.5 * SHAPE_SCALE,
    shadow: `${5 * SHAPE_SCALE}px ${5 * SHAPE_SCALE}px 0 ${color.ink}`,
  },
  meter: {
    height: 16 * SHAPE_SCALE,
    radius: 9 * SHAPE_SCALE,
    border: 2.5 * SHAPE_SCALE,
  },
  sticker: {radius: 0, tilt: 4, padX: 30 * SHAPE_SCALE, padY: 18 * SHAPE_SCALE},
} as const;

/** Длительности — только в кадрах. */
export const dur = {
  micro: 6,
  elem: 10,
  block: 18,
  beat: 24,
  /** Пауза перед событием. Ничего не двигается. */
  hold: 18,
  /** Шаг каскада внутри блока. Максимум 5 элементов подряд. */
  stagger: 3,
  /** Отставание следствия от причины: слоты за метром. */
  lag: 8,
} as const;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  travel: Easing.bezier(0.45, 0.05, 0.55, 0.95),
} as const;

export const popSpring: Partial<SpringConfig> = {damping: 12, stiffness: 180};

export const pop = (frame: number, delay = 0) =>
  spring({frame: frame - delay, fps: FPS, config: popSpring});

/** Дрейф камеры: 1.0 → 1.05 за весь выпуск. Задаётся обёрткой, не сценами. */
export const cameraDrift = {from: 1, to: 1.05, easing: ease.travel} as const;

export const beats = {
  hook: {from: 0, durationInFrames: 90},
  answer: {from: 90, durationInFrames: 210},
  event: {from: 300, durationInFrames: 390},
  outro: {from: 690, durationInFrames: 210},
} as const;

export type BeatName = keyof typeof beats;
