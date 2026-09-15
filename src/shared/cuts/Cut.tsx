import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {
  cameraDrift,
  color,
  DURATION,
  grid,
  safe,
  WIDTH,
} from '../motion/theme';
import {TitleBlock} from '../motion/components/TitleBlock';
import {Meter} from '../motion/components/Meter';
import {Sticker} from '../motion/components/Sticker';
import {Captions} from '../motion/components/Captions';
import {Lanes} from './components/Lanes';
import {Pools} from './components/Pools';
import type {CutSpec} from './types';

const CONTENT_WIDTH = WIDTH - safe.side * 2;

/** Схема живёт между заголовком и показанием, в зону субтитров не заезжает. */
const SCHEMA_TOP = 760;
const SCHEMA_HEIGHT = 520;
const METER_TOP = 1310;
const STICKER_TOP = 1450;

/**
 * Перебивка на полный экран: кадр закрывается целиком, звук мастера идёт под ней.
 * Цвет, кегли и характер движения — из `motion/theme`, своих значений здесь нет.
 */
export const Cut: React.FC<{spec: CutSpec}> = ({spec}) => {
  const frame = useCurrentFrame();

  /** Дрейф камеры той же скорости, что в 900-кадровом выпуске. */
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

        {/* Лида в перебивке нет: смысл несёт схема, а не абзац под заголовком. */}
        <div
          style={{
            position: 'absolute',
            left: safe.side,
            right: safe.side,
            top: safe.top,
          }}
        >
          <TitleBlock
            kicker={spec.kicker}
            badge={spec.badge}
            title={spec.title}
            titleSize={spec.titleSize}
            lead=""
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: safe.side,
            top: SCHEMA_TOP,
            width: CONTENT_WIDTH,
            height: SCHEMA_HEIGHT,
          }}
        >
          {spec.pools ? (
            <Pools
              caller={spec.pools.caller}
              pools={spec.pools.pools}
              steps={spec.pools.steps}
              tone={spec.tone}
              width={CONTENT_WIDTH}
              height={SCHEMA_HEIGHT}
            />
          ) : spec.lanes ? (
            <Lanes
              total={spec.lanes.total}
              steps={spec.lanes.steps}
              tone={spec.tone}
              width={CONTENT_WIDTH}
              height={SCHEMA_HEIGHT}
            />
          ) : null}
        </div>

        {spec.meter ? (
          <Sequence from={spec.meter.at} name="meter">
            <div
              style={{position: 'absolute', left: safe.side, top: METER_TOP}}
            >
              <Meter
                label={spec.meter.label}
                from={spec.meter.from}
                to={spec.meter.to}
                tone={spec.meter.tone}
                width={CONTENT_WIDTH}
              />
            </div>
          </Sequence>
        ) : null}

        {spec.sticker ? (
          <Sequence from={spec.sticker.at} name="sticker">
            <div
              style={{position: 'absolute', left: safe.side, top: STICKER_TOP}}
            >
              <Sticker
                text={spec.sticker.text}
                tone={spec.sticker.tone}
                tilt={spec.sticker.tilt}
              />
            </div>
          </Sequence>
        ) : null}

        {spec.captions.map((caption, i) => (
          <Sequence
            key={i}
            from={caption.at}
            durationInFrames={caption.until - caption.at}
            name={`caption: ${caption.text}`}
          >
            <Captions text={caption.text} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
