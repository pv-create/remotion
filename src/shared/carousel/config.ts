import {FPS, WIDTH} from '../motion/theme';

/** Формат ленты Instagram 4:5. Ширина та же, что у роликов. */
export const CAROUSEL_WIDTH = WIDTH;
export const CAROUSEL_HEIGHT = 1350;
export const CAROUSEL_FPS = FPS;

/**
 * Компоненты обучалок анимируются от нулевого кадра. Слайд — стоп-кадр,
 * поэтому каждый рендерится сдвинутым на столько кадров, что всё уже
 * встало, включая перелёт стикера.
 */
export const SETTLED_FRAME = 2 * FPS;
