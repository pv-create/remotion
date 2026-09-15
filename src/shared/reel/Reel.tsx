import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {MemeCard} from '../overlays/MemeCard';
import {EmojiPop} from '../overlays/EmojiPop';
import {BrollClip} from '../overlays/BrollClip';
import {Cut} from '../cuts/Cut';
import {FPS, type Episode} from './types';

const secToFrames = (sec: number) => Math.round(sec * FPS);
/** громкость SFX по умолчанию: озвучка в прокси около −20 dB mean, звук — акцент, а не второй голос */
const SFX_VOLUME = 0.5;

export const Reel: React.FC<{episode: Episode}> = ({episode}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile(episode.videoSrc)} />

      {episode.overlays.map((item, i) => {
        const from = secToFrames(item.from);
        const durationInFrames = secToFrames(item.to) - from;

        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={durationInFrames}
            name={`${item.kind}: ${item.note}`}
          >
            {item.kind === 'sfx' ? (
              <Audio src={staticFile(item.src)} volume={item.volume ?? SFX_VOLUME} />
            ) : item.kind === 'cut' ? (
              <Cut spec={item.spec} />
            ) : item.kind === 'broll' ? (
              <BrollClip
                src={item.src}
                startFrom={item.startFrom}
                mode={item.mode}
                width={item.width}
                x={item.x}
                y={item.y}
                rotate={item.rotate}
                durationInFrames={durationInFrames}
              />
            ) : item.kind === 'meme' ? (
              <MemeCard
                src={item.src}
                width={item.width}
                x={item.x}
                y={item.y}
                rotate={item.rotate}
                durationInFrames={durationInFrames}
              />
            ) : (
              <EmojiPop
                char={item.char}
                size={item.size}
                x={item.x}
                y={item.y}
                rotate={item.rotate}
                durationInFrames={durationInFrames}
              />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
