import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, safe, type as t} from '../theme';

/**
 * Единственный инверсный кадр выпуска: фон `ink`.
 * Вывод одной строкой плюс крючок следующего выпуска.
 */
export const Outro: React.FC<{verdict: string; next: string}> = ({verdict, next}) => {
  const frame = useCurrentFrame();

  const rise = (i: number) => {
    const delay = i * dur.stagger;
    const progress = interpolate(frame, [delay, delay + dur.block], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease.out,
    });
    return {
      opacity: progress,
      transform: `translateY(${(1 - progress) * dur.block}px)`,
    };
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        paddingLeft: safe.side,
        paddingRight: safe.side,
        paddingBottom: safe.captions,
        justifyContent: 'flex-end',
      }}
    >
      <div style={{...t.title, ...rise(0), color: color.paper}}>{verdict}</div>
      <div
        style={{
          ...t.dataLabel,
          ...rise(1),
          color: color.accent,
          marginTop: dur.beat,
        }}
      >
        {next}
      </div>
    </AbsoluteFill>
  );
};
