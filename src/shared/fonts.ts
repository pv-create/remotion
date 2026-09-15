import {loadFont} from '@remotion/google-fonts/NotoColorEmoji';

// Системный Apple Color Emoji headless Chrome при рендере может не подхватить —
// в Studio эмодзи будут цветными, а в готовом файле превратятся в пустые квадраты.
// Поэтому шрифт грузим явно.
const {fontFamily} = loadFont();

export const emojiFontFamily = `${fontFamily}, "Apple Color Emoji", sans-serif`;
