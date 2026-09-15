import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {dur, ease} from '../theme';

/**
 * Сквозной объект между битами: не исчезает, а переезжает и меняет масштаб.
 * Один такой объект на выпуск.
 */
export const Handoff: React.FC<{
  to: {x: number; y: number};
  scale: number;
  children: React.ReactNode;
}> = ({to, scale, children}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, dur.beat], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });

  return (
    <div
      style={{
        transform: `translate(${to.x * progress}px, ${to.y * progress}px) scale(${interpolate(progress, [0, 1], [1, scale])})`,
        transformOrigin: 'left top',
      }}
    >
      {children}
    </div>
  );
};
