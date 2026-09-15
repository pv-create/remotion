/**
 * Motion-система «BACKEND ЗА 30 СЕКУНД» — токены.
 * Единственный источник значений. Никаких литералов в компонентах.
 */

import { Easing, spring, type SpringConfig } from 'remotion';

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

export const grid = { step: 24, opacity: 0.05 } as const;

export const font = {
  display: 'Montserrat',
  body: '"IBM Plex Sans"',
} as const;

export const type = {
  kicker:   { fontFamily: font.display, fontWeight: 700, fontSize: 30,  letterSpacing: '0.2em',   textTransform: 'uppercase', color: color.muted },
  title:    { fontFamily: font.display, fontWeight: 900, fontSize: 112, lineHeight: 0.92, letterSpacing: '-0.02em', textTransform: 'uppercase' },
  lead:     { fontFamily: font.body,    fontWeight: 400, fontSize: 42,  lineHeight: 1.35 },
  caption:  { fontFamily: font.display, fontWeight: 800, fontSize: 46,  lineHeight: 1.25, textAlign: 'center' },
  readout:  { fontFamily: font.display, fontWeight: 900, fontSize: 64,  letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' },
  dataLabel:{ fontFamily: font.display, fontWeight: 700, fontSize: 26,  letterSpacing: '0.16em',  textTransform: 'uppercase', color: color.muted },
} as const;

export const shape = {
  slot: { size: 74, radius: 12, border: 2.5, shadow: `5px 5px 0 ${color.ink}` },
  meter: { height: 16, radius: 9, border: 2.5 },
  sticker: { radius: 0, tilt: 4, padX: 30, padY: 18 },
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

export const popSpring: Partial<SpringConfig> = { damping: 12, stiffness: 180 };

export const pop = (frame: number, delay = 0) =>
  spring({ frame: frame - delay, fps: FPS, config: popSpring });

/** Дрейф камеры: 1.0 → 1.05 за весь выпуск. Задаётся обёрткой, не сценами. */
export const cameraDrift = { from: 1, to: 1.05, easing: ease.travel } as const;

export const beats = {
  hook:   { from: 0,   durationInFrames: 90 },
  answer: { from: 90,  durationInFrames: 210 },
  event:  { from: 300, durationInFrames: 390 },
  outro:  { from: 690, durationInFrames: 210 },
} as const;

export type BeatName = keyof typeof beats;
