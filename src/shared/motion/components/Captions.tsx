import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, safe, type as t, HEIGHT} from '../theme';

/**
 * Субтитры. Только прозрачность, зона не двигается и ничем не делится.
 */
export const Captions: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, dur.micro], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: safe.side,
        right: safe.side,
        top: HEIGHT - safe.captions,
        height: safe.captions - safe.bottom,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div style={{...t.caption, color: color.ink}}>{text}</div>
    </div>
  );
};
