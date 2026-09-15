import React from 'react';
import {useCurrentFrame} from 'remotion';
import {color, pop, shape, font, type as t} from '../theme';
import type {StickerSpec} from '../types';

/** Стикер. Один на кадр. Без скруглений, наклон ±3…5°, подача с перелётом. */
export const Sticker: React.FC<StickerSpec> = ({text, tone, tilt = shape.sticker.tilt}) => {
  const frame = useCurrentFrame();
  const p = pop(frame);

  return (
    <div
      style={{
        alignSelf: 'flex-start',
        backgroundColor: tone === 'alarm' ? color.alarm : color.accent,
        color: tone === 'alarm' ? color.paper : color.ink,
        fontFamily: font.display,
        fontWeight: 800,
        fontSize: t.lead.fontSize,
        padding: `${shape.sticker.padY}px ${shape.sticker.padX}px`,
        borderRadius: shape.sticker.radius,
        transform: `scale(${p}) rotate(${tilt * p}deg)`,
        opacity: p,
      }}
    >
      {text}
    </div>
  );
};
