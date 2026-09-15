import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {emojiFontFamily} from '../fonts';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const EmojiPop: React.FC<{
  char: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  durationInFrames: number;
}> = ({char, size, x, y, rotate, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: {damping: 9, stiffness: 220, mass: 0.6},
    durationInFrames: 16,
  });

  const exitStart = durationInFrames - 6;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], clamp);

  const scale = interpolate(pop, [0, 0.7, 1], [0, 1.15, 1], clamp) * exit;
  const tilt = interpolate(pop, [0, 1], [rotate - 20, rotate], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        fontFamily: emojiFontFamily,
        lineHeight: 1,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${tilt}deg)`,
        opacity: exit,
        filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.5))',
      }}
    >
      {char}
    </div>
  );
};
