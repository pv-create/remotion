import React from 'react';
import {useCurrentFrame} from 'remotion';
import {color, dur, pop, shape, type as t} from '../theme';
import type {SlotRowSpec, Tone} from '../types';

/**
 * Ряд слотов. Следствие отстаёт от причины: слоты включаются позже метра
 * на `lag`, дальше каскадом с шагом `dur.stagger`.
 */
export const SlotRow: React.FC<SlotRowSpec & {tone: Extract<Tone, 'accent' | 'alarm'>}> = ({
  total,
  activeFrom,
  activeTo,
  lag = dur.lag,
  tone,
}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;

  return (
    <div style={{display: 'flex', gap: shape.slot.size / 2}}>
      {Array.from({length: total}, (_, i) => {
        const index = i + 1;
        /** Слоты до activeFrom горят с самого начала бита. */
        const preset = index <= activeFrom;
        const delay = preset ? 0 : lag + (index - activeFrom - 1) * dur.stagger;
        const on = index <= activeTo && frame >= delay;
        const scale = on ? pop(frame, delay) : 0;

        return (
          <div
            key={index}
            style={{
              width: shape.slot.size,
              height: shape.slot.size,
              borderRadius: shape.slot.radius,
              border: `${shape.slot.border}px solid ${on ? color.ink : color.line}`,
              backgroundColor: on ? fill : 'transparent',
              boxShadow: on ? shape.slot.shadow : 'none',
              transform: on ? `scale(${0.9 + scale * 0.1})` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...t.dataLabel,
              letterSpacing: 0,
              color: on ? color.ink : color.muted,
            }}
          >
            {index}
          </div>
        );
      })}
    </div>
  );
};
