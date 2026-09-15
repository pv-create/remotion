import React from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const MemeCard: React.FC<{
  src: string;
  width: number;
  x: number;
  y: number;
  rotate: number;
  durationInFrames: number;
}> = ({src, width, x, y, rotate, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Влёт: упругая пружина, карточка «шлёпается» в кадр.
  const enter = spring({
    frame,
    fps,
    config: {damping: 12, stiffness: 200, mass: 0.7},
    durationInFrames: 14,
  });

  // Вылет: последние 8 кадров.
  const exitStart = durationInFrames - 8;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], clamp);

  const scale = interpolate(enter, [0, 1], [0.55, 1], clamp) * interpolate(exit, [0, 1], [0.85, 1], clamp);
  const opacity = interpolate(enter, [0, 0.4], [0, 1], clamp) * exit;

  // Лёгкий постоянный дрейф, чтобы карточка не выглядела приклеенной.
  const drift = Math.sin(frame / 18) * 1.5;
  const tilt = interpolate(enter, [0, 1], [rotate - 14, rotate], clamp) + drift;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${tilt}deg)`,
        opacity,
        borderRadius: 24,
        border: '8px solid white',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
        backgroundColor: 'white',
        lineHeight: 0,
      }}
    >
      <Img src={staticFile(src)} style={{width: '100%', display: 'block'}} />
    </div>
  );
};
