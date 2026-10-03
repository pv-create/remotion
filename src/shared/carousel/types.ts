/**
 * Карусель в ленту: 1080×1350, один кадр композиции — один слайд.
 * Текст — данные фичи (`src/features/<имя>/carousel.json`), как у обучалок.
 * Нумерация «3 / 8» и номера шагов считаются сами.
 */

/** Плитка на слайде-списке: короткое слово крупно и подпись. */
export interface Tile {
  title: string;
  text: string;
}

export type Slide =
  | {
      /** Обложка: заголовочный блок обучалки и стикер. */
      kind: 'cover';
      kicker: string;
      badge: string;
      title: string;
      /** То же переопределение кегля, что у обучалок: 112 px на ~11 заглавных. */
      titleSize?: number;
      lead: string;
      sticker?: string;
    }
  | {
      /** Вводный слайд: заголовок, пункты, плитки. */
      kind: 'list';
      kicker: string;
      badge: string;
      title: string;
      titleSize?: number;
      points: string[];
      tiles?: Tile[];
    }
  | {
      /** Шаг: номер в слоте, заголовок, пункты, карточка «Практика». */
      kind: 'step';
      /** Надзаголовок перед номером: «способ» → «способ #1». */
      label: string;
      title: string;
      titleSize?: number;
      tags?: string[];
      points: string[];
      practice?: string;
    }
  | {
      /** Финал: инверсный кадр, как outro у обучалок. */
      kind: 'outro';
      kicker: string;
      title: string;
      titleSize?: number;
      lead: string;
      /** Призыв одной фразой, акцентом. */
      action?: string;
      sticker?: string;
    };

export interface Carousel {
  /** id композиции в Studio. */
  id: string;
  slides: Slide[];
}
