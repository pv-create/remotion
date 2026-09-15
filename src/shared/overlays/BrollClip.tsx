import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {color} from '../motion/theme';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

/**
 * Подсъём. Всегда без звука — своя дорожка перебила бы озвучку.
 *
 * mode 'full' — на весь кадр, для перебивок в тесной крупности.
 * mode 'card' — карточкой поверх видео, как мем.
 */
export const BrollClip: React.FC<{
  src: string;
  /** с какой секунды исходного клипа начинать */
  startFrom: number;
  mode: 'full' | 'card';
  durationInFrames: number;
  width?: number;
  x?: number;
  y?: number;
  rotate?: number;
}> = ({src, startFrom, mode, durationInFrames, width, x, y, rotate = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fade = Math.min(
    interpolate(frame, [0, 4], [0, 1], clamp),
    interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], clamp),
  );

  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={Math.round(startFrom * fps)}
      muted
      style={{width: '100%', height: '100%', objectFit: 'cover'}}
    />
  );

  if (mode === 'full') {
    return (
      <AbsoluteFill style={{opacity: fade, backgroundColor: color.ink}}>
        {video}
      </AbsoluteFill>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height: (width ?? 0) * 1.2,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        opacity: fade,
        borderRadius: 24,
        border: '8px solid white',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
      }}
    >
      {video}
    </div>
  );
};
