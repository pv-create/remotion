import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './shared/reel/Reel';
import {Episode as MotionEpisode} from './shared/motion/Episode';
import {DURATION as MOTION_DURATION} from './shared/motion/theme';
import {Carousel} from './shared/carousel/Carousel';
import {
  CAROUSEL_FPS,
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
} from './shared/carousel/config';
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
        ) : feature.kind === 'carousel' ? (
          <Composition
            key={feature.carousel.id}
            id={feature.carousel.id}
            component={Carousel}
            durationInFrames={feature.carousel.slides.length}
            fps={CAROUSEL_FPS}
            width={CAROUSEL_WIDTH}
            height={CAROUSEL_HEIGHT}
            defaultProps={{carousel: feature.carousel}}
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
