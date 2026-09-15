import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, shape, type as t} from '../theme';
import type {MeterSpec} from '../types';

/**
 * Шкала. Полоса растёт первой, число догоняет её на dur.stagger.
 * Готового числа на экране не бывает — всегда интерполяция от `from` к `to`.
 *
 * Отклонение от §7: там указан рост 14f, но 14 нет в `dur`, а чек-лист
 * требует брать длительности только оттуда. Взят ближайший по смыслу
 * `dur.block`.
 */
export const Meter: React.FC<MeterSpec & {width: number}> = ({
  label,
  from,
  to,
  tone,
  width,
}) => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  const bar = interpolate(frame, [0, dur.block], [from, to], {
    ...clamp,
    easing: ease.out,
  });

  const readout = interpolate(
    frame,
    [dur.stagger, dur.block + dur.stagger],
    [from, to],
    {...clamp, easing: ease.out},
  );

  return (
    <div style={{width}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: dur.elem,
        }}
      >
        <span style={t.dataLabel}>{label}</span>
        <span style={{...t.readout, color: color.ink}}>
          {Math.round(readout)}%
        </span>
      </div>

      <div
        style={{
          height: shape.meter.height,
          borderRadius: shape.meter.radius,
          border: `${shape.meter.border}px solid ${color.ink}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${bar}%`,
            height: '100%',
            backgroundColor: tone === 'alarm' ? color.alarm : color.accent,
          }}
        />
      </div>
    </div>
  );
};
