import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './shared/reel/Reel';
import {Episode as MotionEpisode} from './shared/motion/Episode';
import {DURATION as MOTION_DURATION} from './shared/motion/theme';
import {FPS, WIDTH, HEIGHT} from './shared/config';
import {features} from './features';

export const Root: React.FC = () => {
  return (
    <>
      {features.map((feature) =>
        feature.kind === 'reel' ? (
          <Composition
            key={feature.episode.id}
            id={feature.episode.id}
            component={Reel}
            durationInFrames={feature.episode.durationInFrames}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{episode: feature.episode}}
          />
        ) : (
          <Composition
            key={feature.id}
            id={feature.id}
            component={MotionEpisode}
            durationInFrames={MOTION_DURATION}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{episode: feature.episode}}
          />
        ),
      )}
    </>
  );
};
