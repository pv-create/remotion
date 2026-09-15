import React from 'react';
import {useCurrentFrame} from 'remotion';
import {color, dur, pop, shape, type as t} from '../../motion/theme';
import type {PoolStep, PoolsSpec} from '../types';

/**
 * Кадр, в котором элемент с номером `index` впервые перекрыт счётчиком, и его
 * место в каскаде. `spacing` — шаг между соседями: для появления пулов это
 * `dur.stagger`, для застревающих потоков — `over` шага, растянутый на всех.
 */
const onsetOf = (
  steps: PoolStep[],
  index: number,
  count: (s: PoolStep) => number,
  spacing?: (s: PoolStep, delta: number) => number,
) => {
  for (let k = 0; k < steps.length; k++) {
    const now = count(steps[k]);
    if (now > index) {
      const before = k > 0 ? count(steps[k - 1]) : 0;
      const delta = now - before;
      const step = spacing ? spacing(steps[k], delta) : dur.stagger;
      return steps[k].at + (index - before) * step;
    }
  }
  return null;
};

const firstFrame = (steps: PoolStep[], test: (s: PoolStep) => boolean) => {
  const hit = steps.find(test);
  return hit ? hit.at : null;
};

/** Стрелка «пул ходит в ресурс». Форма без скруглений, цвет — только ink/line. */
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

/** Слот потока. Пустой — контур `line`; занятый — заливка, обводка `ink`, тень. */
const Slot: React.FC<{size: number; fill: string | null; scale: number}> = ({
  size,
  fill,
  scale,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: (shape.slot.radius * size) / shape.slot.size,
      border: `${shape.slot.border}px solid ${fill ? color.ink : color.line}`,
      backgroundColor: fill ?? 'transparent',
      boxShadow: fill ? shape.slot.shadow : 'none',
      transform: `scale(${scale})`,
      boxSizing: 'border-box',
    }}
  />
);

/**
 * Пулы потоков вызывающего сервиса. Рамка — сам сервис; внутри по строке на
 * пул: слоты потоков → стрелка → ресурс. Застрявший поток заливается тоном
 * перебивки (`alarm` в проблеме) или `ink` там, где alarm уже ушёл; рабочий —
 * `accent`. Зависший ресурс заливается тем же цветом, что застрявшие потоки.
 * Лёгший сервис — рамка `alarm`.
 *
 * Отклонение от §8 хендоффа то же, что у дорожек: шаги схемы заданы кадрами
 * в данных, а не вложенными `Sequence`, — пулы живут через всю перебивку.
 */
export const Pools: React.FC<
  PoolsSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({caller, pools, steps, tone, width, height}) => {
  const frame = useCurrentFrame();
  const stuckFill = tone === 'alarm' ? color.alarm : color.ink;

  const deadAt = firstFrame(steps, (s) => s.dead === true);
  const dead = deadAt !== null && frame >= deadAt;

  const pad = dur.beat;
  const border = shape.slot.border;
  const headerH = t.dataLabel.fontSize + dur.micro * 2;
  const innerW = width - pad * 2 - border * 2;
  const rowsH = height - pad * 2 - border * 2 - headerH;
  const rows = pools.length;
  // Офсетная тень слота уходит на 10 px вниз — зазор должен быть больше неё.
  const gap = dur.elem + dur.micro;
  const laneH = Math.min(shape.slot.size, (rowsH - gap * (rows - 1)) / rows);

  const gapX = dur.elem + dur.micro;
  const arrowW = dur.beat * 2;
  const targetW = shape.slot.size * 2 + dur.beat;
  const slotGap = dur.elem + 2;
  const slotsW = innerW - targetW - arrowW - gapX * 2;

  const stuckSpacing = (s: PoolStep, delta: number) =>
    (s.over ?? dur.block) / Math.max(delta, 1);

  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        padding: pad,
        borderRadius: shape.slot.radius,
        border: `${border}px solid ${dead ? color.alarm : color.ink}`,
        display: 'flex',
        flexDirection: 'column',
        gap,
      }}
    >
      <div
        style={{
          ...t.dataLabel,
          height: headerH,
          lineHeight: `${headerH}px`,
          color: dead ? color.alarm : color.ink,
        }}
      >
        {caller}
      </div>

      {/* Строки центруются в остатке рамки: один пул не липнет к заголовку. */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap,
        }}
      >
        {pools.map((pool, p) => {
          const openAt = onsetOf(steps, p, (s) => s.open);
          const visible = openAt !== null && frame >= openAt;
          const rowScale = visible ? 0.9 + pop(frame, openAt) * 0.1 : 0;

          const hungAt = firstFrame(steps, (s) => (s.hung ?? []).includes(p));
          const hung = hungAt !== null && frame >= hungAt;
          const targetFill = hung ? stuckFill : null;

          const slotSize = Math.min(
            laneH,
            (slotsW - slotGap * (pool.size - 1)) / pool.size,
          );

          return (
            <div
              key={p}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: gapX,
                height: laneH,
                opacity: visible ? 1 : 0,
                transform: `scale(${rowScale})`,
                transformOrigin: 'left center',
              }}
            >
              <div
                style={{
                  width: slotsW,
                  display: 'flex',
                  alignItems: 'center',
                  gap: slotGap,
                }}
              >
                {Array.from({length: pool.size}, (_, i) => {
                  const stuckAt = onsetOf(
                    steps,
                    i,
                    (s) => s.stuck[p] ?? 0,
                    stuckSpacing,
                  );
                  const busyAt = onsetOf(
                    steps,
                    i,
                    (s) => s.busy?.[p] ?? 0,
                    stuckSpacing,
                  );
                  const isStuck = stuckAt !== null && frame >= stuckAt;
                  const isBusy = !isStuck && busyAt !== null && frame >= busyAt;
                  const onset = isStuck ? stuckAt : isBusy ? busyAt : null;
                  const fill = isStuck
                    ? stuckFill
                    : isBusy
                      ? color.accent
                      : null;
                  return (
                    <Slot
                      key={i}
                      size={slotSize}
                      fill={fill}
                      scale={
                        onset === null ? 0.9 : 0.9 + pop(frame, onset) * 0.1
                      }
                    />
                  );
                })}
              </div>

              <Arrow width={arrowW} active={visible && !hung} />

              <div
                style={{
                  width: targetW,
                  height: laneH * 0.72,
                  boxSizing: 'border-box',
                  borderRadius: shape.meter.radius,
                  border: `${shape.meter.border}px solid ${color.ink}`,
                  backgroundColor: targetFill ?? 'transparent',
                  boxShadow: targetFill ? shape.slot.shadow : 'none',
                  transform: `scale(${hung ? 0.9 + pop(frame, hungAt as number) * 0.1 : 1})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...t.dataLabel,
                  letterSpacing: '0.08em',
                  color: targetFill ? color.paper : color.ink,
                }}
              >
                {pool.target}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
