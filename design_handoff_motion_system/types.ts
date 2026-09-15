import type { BeatName } from './theme';

/** Тональность элемента. `alarm` допустим только в бите hook. */
export type Tone = 'accent' | 'alarm' | 'ink' | 'muted';

export interface Caption {
  beat: BeatName;
  /** Максимум две строки при 46px в кадре 1080. */
  text: string;
}

export interface MeterSpec {
  label: string;
  /** Проценты. Число анимируется от `from` к `to`, готовых чисел не бывает. */
  from: number;
  to: number;
  tone: Extract<Tone, 'accent' | 'alarm'>;
}

export interface SlotRowSpec {
  /** 3 крупных слота читаются с телефона; 5 мелких — нет. */
  total: number;
  activeFrom: number;
  activeTo: number;
  /** Отставание следствия от причины, кадры. По умолчанию dur.lag. */
  lag?: number;
}

export interface StickerSpec {
  text: string;
  tone: Extract<Tone, 'accent' | 'alarm'>;
  /** Наклон в градусах, ±3…5. */
  tilt?: number;
}

export interface Episode {
  slug: string;
  kicker: string;
  badge: string;
  title: string;
  lead: string;

  hook: {
    meter: MeterSpec;
    slots: SlotRowSpec;
    sticker: StickerSpec;
  };

  event: {
    meter: MeterSpec;
    slots: SlotRowSpec;
    sticker?: StickerSpec;
  };

  outro: {
    verdict: string;
    next: string;
  };

  captions: Caption[];
}
