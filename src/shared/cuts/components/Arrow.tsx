import React from 'react';
import {color, dur, shape} from '../../motion/theme';

export type Pt = {x: number; y: number};

/** Остриё — те же пропорции, что у CSS-стрелок дорожек и пулов. */
const HEAD_L = dur.elem * 2;
const HEAD_W = dur.elem * 1.4 * 2;

/**
 * Стрелка схемы: линия растёт от `from` к основанию острия, остриё упирается
 * в `to`. `line`, пока по ней ничего не прошло, `ink` — когда активна.
 */
export const Arrow: React.FC<{
  from: Pt;
  to: Pt;
  progress: number;
  active: boolean;
}> = ({from, to, progress, active}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const base = {x: to.x - ux * HEAD_L, y: to.y - uy * HEAD_L};
  const end = {
    x: from.x + (base.x - from.x) * progress,
    y: from.y + (base.y - from.y) * progress,
  };
  const px = -uy * (HEAD_W / 2);
  const py = ux * (HEAD_W / 2);
  const stroke = active ? color.ink : color.line;
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={end.x}
        y2={end.y}
        stroke={stroke}
        strokeWidth={shape.meter.border}
        strokeLinecap="round"
      />
      <polygon
        points={`${to.x},${to.y} ${base.x + px},${base.y + py} ${base.x - px},${base.y - py}`}
        fill={stroke}
        opacity={progress}
      />
    </g>
  );
};
