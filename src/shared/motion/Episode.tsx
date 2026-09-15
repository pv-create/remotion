import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {
  beats,
  cameraDrift,
  color,
  DURATION,
  dur,
  grid,
  safe,
  WIDTH,
} from './theme';
import type {Episode as EpisodeData} from './types';
import type {BeatName} from './theme';
import {TitleBlock} from './components/TitleBlock';
import {Meter} from './components/Meter';
import {SlotRow} from './components/SlotRow';
import {Sticker} from './components/Sticker';
import {Captions} from './components/Captions';
import {Outro} from './components/Outro';
import {Handoff} from './components/Handoff';

const CONTENT_WIDTH = WIDTH - safe.side * 2;

/** Схема живёт в центральной половине кадра и не выходит из неё. */
const SCHEMA_TOP = 900;
const STICKER_TOP = 1450;

const Schema: React.FC<{
  spec: EpisodeData['hook'] | EpisodeData['event'];
}> = ({spec}) => (
  <>
    <div style={{position: 'absolute', left: safe.side, top: SCHEMA_TOP}}>
      <SlotRow {...spec.slots} tone={spec.meter.tone} />
      <div style={{marginTop: dur.beat * 4}}>
        <Meter {...spec.meter} width={CONTENT_WIDTH} />
      </div>
    </div>
    {spec.sticker ? (
      <div style={{position: 'absolute', left: safe.side, top: STICKER_TOP}}>
        <Sticker {...spec.sticker} />
      </div>
    ) : null}
  </>
);

const captionFor = (episode: EpisodeData, beat: BeatName) =>
  episode.captions.find((c) => c.beat === beat)?.text ?? '';

export const Episode: React.FC<{episode: EpisodeData}> = ({episode}) => {
  const frame = useCurrentFrame();

  /** Дрейф камеры задаётся здесь; сцены о нём не знают. */
  const scale = interpolate(
    frame,
    [0, DURATION],
    [cameraDrift.from, cameraDrift.to],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: cameraDrift.easing,
    },
  );

  return (
    <AbsoluteFill style={{backgroundColor: color.paper}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${color.ink} 1px, transparent 1px), linear-gradient(90deg, ${color.ink} 1px, transparent 1px)`,
            backgroundSize: `${grid.step}px ${grid.step}px`,
            opacity: grid.opacity,
          }}
        />

        {/* hook: только проблема, заголовка нет */}
        <Sequence {...beats.hook} name="hook">
          <Schema spec={episode.hook} />
          <Captions text={captionFor(episode, 'hook')} />
        </Sequence>

        {/* answer: заголовок как ответ. Схемы нет — alarm ушёл вместе с ней */}
        <Sequence {...beats.answer} name="answer">
          <div
            style={{
              position: 'absolute',
              left: safe.side,
              right: safe.side,
              top: safe.top,
            }}
          >
            <TitleBlock
              kicker={episode.kicker}
              badge={episode.badge}
              title={episode.title}
              titleSize={episode.titleSize}
              lead={episode.lead}
            />
          </div>
          <Captions text={captionFor(episode, 'answer')} />
        </Sequence>

        {/* заголовок остаётся на экране до аутро */}
        <Sequence
          from={beats.answer.from + beats.answer.durationInFrames}
          durationInFrames={beats.event.durationInFrames}
          name="title-hold"
        >
          <div
            style={{
              position: 'absolute',
              left: safe.side,
              right: safe.side,
              top: safe.top,
            }}
          >
            <TitleBlock
              kicker={episode.kicker}
              badge={episode.badge}
              title={episode.title}
              titleSize={episode.titleSize}
              lead={episode.lead}
            />
          </div>
        </Sequence>

        {/* event: перед событием пауза hold, потом метр ведёт, слоты догоняют */}
        <Sequence
          from={beats.event.from + dur.hold}
          durationInFrames={beats.event.durationInFrames - dur.hold}
          name="event"
        >
          <Schema spec={episode.event} />
        </Sequence>
        <Sequence {...beats.event} name="event-captions">
          <Captions text={captionFor(episode, 'event')} />
        </Sequence>

        {/* outro: инверсный кадр, схема переезжает наверх и уменьшается */}
        <Sequence {...beats.outro} name="outro">
          <Outro verdict={episode.outro.verdict} next={episode.outro.next} />
          <div style={{position: 'absolute', left: safe.side, top: safe.top}}>
            <Handoff to={{x: 0, y: 0}} scale={0.6}>
              <SlotRow
                {...episode.event.slots}
                activeFrom={episode.event.slots.activeTo}
                lag={0}
                tone="accent"
              />
            </Handoff>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
