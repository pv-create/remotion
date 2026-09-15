import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, pop, shape, type as t} from '../../motion/theme';
import type {CutStep} from '../types';

/** Ёмкость очереди: столько сообщений помещается в дорожку партиции. */
const CAP = 10;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const cellsOf = (step: CutStep, lane: number) =>
  Array.isArray(step.cells) ? (step.cells[lane] ?? 0) : step.cells;

/** Шаг, который уже наступил к этому кадру, и предыдущий — между ними интерполяция. */
const stepAt = (steps: CutStep[], frame: number) => {
  let i = 0;
  for (let k = 0; k < steps.length; k++) {
    if (steps[k].at <= frame) i = k;
  }
  return {cur: steps[i], prev: steps[i - 1] ?? steps[i]};
};

/**
 * Кадр включения элемента и его место в каскаде: элемент появляется в том шаге,
 * где счётчик впервые перекрыл его номер, и отстаёт от соседа на `stagger`.
 */
const onsetOf = (
  steps: CutStep[],
  index: number,
  count: (s: CutStep) => number,
) => {
  for (let k = 0; k < steps.length; k++) {
    if (count(steps[k]) > index) {
      const before = k > 0 ? count(steps[k - 1]) : 0;
      return steps[k].at + (index - before) * dur.stagger;
    }
  }
  return null;
};

/** Стрелка «дорожку кто-то читает». Форма без скруглений, цвет — только ink/line. */
const Arrow: React.FC<{width: number; active: boolean}> = ({width, active}) => (
  <div style={{width, display: 'flex', justifyContent: 'center'}}>
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: `${dur.elem * 1.4}px solid transparent`,
        borderBottom: `${dur.elem * 1.4}px solid transparent`,
        borderLeft: `${dur.elem * 2}px solid ${active ? color.ink : color.line}`,
      }}
    />
  </div>
);

const Chip: React.FC<{
  size: number;
  label: string;
  fill: string | null;
  scale: number;
}> = ({size, label, fill, scale}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: shape.slot.radius,
      border: `${shape.slot.border}px solid ${fill ? color.ink : color.line}`,
      backgroundColor: fill ?? 'transparent',
      boxShadow: fill ? shape.slot.shadow : 'none',
      transform: `scale(${scale})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...t.dataLabel,
      letterSpacing: 0,
      color: fill ? color.ink : color.muted,
    }}
  >
    {label}
  </div>
);

/**
 * Партиции топика: дорожка с очередью сообщений, стрелка, консьюмер на конце.
 * Внизу — консьюмеры, которым партиции не досталось.
 *
 * Отклонение от §8 хендоффа: шаги схемы заданы кадрами в данных, а не
 * вложенными `Sequence`. Дорожки живут через всю перебивку и меняют состояние,
 * а вложенный `Sequence` перезапускал бы их появление с нуля.
 */
export const Lanes: React.FC<{
  total: number;
  steps: CutStep[];
  tone: 'accent' | 'alarm';
  width: number;
  height: number;
}> = ({total, steps, tone, width, height}) => {
  const frame = useCurrentFrame();
  const {cur, prev} = stepAt(steps, frame);
  const fill = tone === 'alarm' ? color.alarm : color.accent;

  const hasIdle = steps.some((s) => (s.idle ?? 0) > 0);
  const rows = total + (hasIdle ? 1 : 0);
  // Офсетная тень слота уходит на 10 px вниз — зазор должен быть больше неё.
  const gap = dur.elem + dur.micro;
  const laneH = Math.min(
    shape.slot.size,
    (height - gap * (rows - 1)) / rows,
  );

  const gapX = dur.elem + dur.micro;
  const labelW = shape.slot.size / 2;
  const arrowW = dur.beat * 2;
  const trackW = width - labelW - arrowW - laneH - gapX * 3;
  const trackH = laneH * 0.72;
  const cellPad = dur.micro;
  const cellGap = dur.stagger * 2;
  const cellW = (trackW - cellPad * 2 - cellGap * (CAP - 1)) / CAP;

  const idle = cur.idle ?? 0;
  const idleOnset = onsetOf(steps, 0, (s) => s.idle ?? 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap,
        height,
      }}
    >
      {Array.from({length: total}, (_, i) => {
        const open = onsetOf(steps, i, (s) => s.open);
        const visible = open !== null && frame >= open;
        const laneScale = visible ? 0.9 + pop(frame, open) * 0.1 : 0;

        const consumer = onsetOf(steps, i, (s) => s.consumers);
        const reading = consumer !== null && frame >= consumer;

        const over = cur.over ?? dur.block;
        const queue = interpolate(
          frame,
          [cur.at, cur.at + over],
          [cellsOf(prev, i), cellsOf(cur, i)],
          {...clamp, easing: ease.out},
        );

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: gapX,
              height: laneH,
              opacity: visible ? 1 : 0,
              transform: `scale(${laneScale})`,
              transformOrigin: 'left center',
            }}
          >
            <div style={{...t.dataLabel, width: labelW, color: color.ink}}>
              P{i}
            </div>

            <div
              style={{
                width: trackW,
                height: trackH,
                borderRadius: shape.meter.radius,
                border: `${shape.meter.border}px solid ${color.ink}`,
                display: 'flex',
                alignItems: 'center',
                gap: cellGap,
                padding: cellPad,
                boxSizing: 'border-box',
              }}
            >
              {Array.from({length: Math.round(queue)}, (_, c) => (
                <div
                  key={c}
                  style={{
                    width: cellW,
                    height: '100%',
                    backgroundColor: fill,
                    borderRadius: shape.slot.radius / 4,
                  }}
                />
              ))}
            </div>

            <Arrow width={arrowW} active={reading} />

            <Chip
              size={laneH}
              label={`C${i + 1}`}
              fill={reading ? fill : null}
              scale={reading ? 0.9 + pop(frame, consumer as number) * 0.1 : 0.9}
            />
          </div>
        );
      })}

      {hasIdle ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: gapX,
            height: laneH,
            opacity: idle > 0 && idleOnset !== null && frame >= idleOnset ? 1 : 0,
          }}
        >
          <div style={{width: labelW}} />
          <div
            style={{
              ...t.dataLabel,
              width: trackW,
              textAlign: 'right',
              color: color.muted,
            }}
          >
            партиции не досталось
          </div>
          <Arrow width={arrowW} active={false} />
          <Chip
            size={laneH}
            label={`C${total + 1}`}
            fill={null}
            scale={
              idleOnset === null ? 0.9 : 0.9 + pop(frame, idleOnset) * 0.1
            }
          />
        </div>
      ) : null}
    </div>
  );
};
