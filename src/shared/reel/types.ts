import type {CutSpec} from '../cuts/types';

export {FPS, WIDTH, HEIGHT} from '../config';

export type Overlay =
  | {
      kind: 'meme';
      /** подпись сиквенса в Studio */
      note: string;
      /** секунды от начала ролика */
      from: number;
      to: number;
      /** путь внутри public/ */
      src: string;
      /** ширина карточки в px */
      width: number;
      /** центр карточки в px */
      x: number;
      y: number;
      /** наклон карточки в градусах */
      rotate: number;
    }
  | {
      kind: 'broll';
      note: string;
      from: number;
      to: number;
      /** путь внутри public/, всегда H.264-прокси */
      src: string;
      /** с какой секунды исходного клипа брать */
      startFrom: number;
      /** 'full' — на весь кадр, 'card' — карточкой поверх видео */
      mode: 'full' | 'card';
      /** только для 'card' */
      width?: number;
      x?: number;
      y?: number;
      rotate?: number;
    }
  | {
      kind: 'cut';
      note: string;
      from: number;
      to: number;
      /** перебивка на полный экран: кадр закрывается целиком, звук идёт под ней */
      spec: CutSpec;
    }
  | {
      kind: 'emoji';
      note: string;
      from: number;
      to: number;
      char: string;
      size: number;
      x: number;
      y: number;
      rotate: number;
    }
  | {
      /** звуковой акцент поверх озвучки; картинки не даёт, ставится на то же слово, что мем */
      kind: 'sfx';
      note: string;
      from: number;
      /** не короче duration из sfx.json, иначе звук обрежется */
      to: number;
      /** путь внутри public/sfx/ */
      src: string;
      /**
       * с какой секунды файла играть. У разгонов и импактов удар не в начале
       * (hit в sfx.json): чтобы он лёг на from, startFrom ставится ≈ hit
       */
      startFrom?: number;
      /** 0…1, по умолчанию 0.5; рекомендация на каждый звук — volume в sfx.json */
      volume?: number;
    };

export type Episode = {
  /** id композиции в Studio и имя при рендере */
  id: string;
  /** путь внутри public/ — прокси H.264 из public/episodes/<фича>/, не оригинал */
  videoSrc: string;
  /** nb_read_frames минус один */
  durationInFrames: number;
  /** замеры кадра — заполнять перед расстановкой оверлеев */
  geometry: {
    hairTop: number;
    eyes: number;
    chin: number;
    subtitleTop: number;
    headLeft: number;
    headRight: number;
  };
  overlays: Overlay[];
};
