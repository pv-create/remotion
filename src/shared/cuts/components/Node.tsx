import React from 'react';
import {color, shape, type as t} from '../../motion/theme';

/**
 * Блок схемы: сервис, брокер, группа консьюмеров. Рамка ink со скруглением
 * метра, подпись данных внутри — та же форма, что у ресурса в пулах.
 * Залитый блок — «происходит сейчас»: тон перебивки и офсетная тень.
 */
export const Node: React.FC<{
  label: string;
  width: number;
  height: number;
  fill?: string | null;
  scale?: number;
  opacity?: number;
}> = ({label, width, height, fill = null, scale = 1, opacity = 1}) => (
  <div
    style={{
      width,
      height,
      boxSizing: 'border-box',
      borderRadius: shape.meter.radius,
      border: `${shape.meter.border}px solid ${color.ink}`,
      backgroundColor: fill ?? 'transparent',
      boxShadow: fill ? shape.slot.shadow : 'none',
      transform: `scale(${scale})`,
      opacity,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      ...t.dataLabel,
      letterSpacing: '0.08em',
      color: fill ? (fill === color.accent ? color.ink : color.paper) : color.ink,
    }}
  >
    {label}
  </div>
);
