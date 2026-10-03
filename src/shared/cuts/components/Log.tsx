import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, font, pop, shape, type as t} from '../../motion/theme';
import type {LogSpec} from '../types';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

/** Курсор консьюмера — остриё той же формы, что у стрелок, смотрит вверх. */
const HEAD_L = dur.elem * 2;
const HEAD_W = dur.elem * 1.4 * 2;

/**
 * Лог Kafka: события в ряд, под ними курсор консьюмера. Прочитанное
 * заливается тоном перебивки и остаётся на месте — в этом отличие от
 * очереди. OFFSET — число прочитанных событий, догоняет курсор. Перемотка
 * назад гасит события за курсором, повтор зажигает их снова.
 */
export const Log: React.FC<
  LogSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({
  cells,
  readAt,
  step: stepProp,
  retentionAt,
  offsetAt,
  rewindAt,
  rewindTo,
  replayAt,
  tone,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;
  const step = stepProp ?? dur.elem;

  const gap = dur.elem + 2;
  const cellW = (width - gap * (cells - 1)) / cells;
  const headerH = t.readout.fontSize * 1.1;
  const cursorH = HEAD_L + dur.micro + t.dataLabel.fontSize;
  const blockH = headerH + dur.elem + cellW + dur.elem + cursorH;
  const top = (height - blockH) / 2;
  const cellsY = top + headerH + dur.elem;
  const cursorY = cellsY + cellW + dur.elem;

  const last = cells - 1;
  const target = Math.max(0, Math.min(last, (rewindTo ?? 1) - 1));
  const forwardEnd = readAt + last * step;
  const rewinding = rewindAt !== undefined && frame >= rewindAt;
  const replaying = rewinding && replayAt !== undefined && frame >= replayAt;

  // положение курсора: номер события с нуля, дробное между ячейками
  let pos: number;
  if (replaying) {
    pos = interpolate(
      frame,
      [replayAt as number, (replayAt as number) + (last - target) * step],
      [target, last],
      clamp,
    );
  } else if (rewinding) {
    pos = interpolate(
      frame,
      [rewindAt as number, (rewindAt as number) + dur.beat],
      [last, target],
      {...clamp, easing: ease.out},
    );
  } else {
    pos = interpolate(frame, [readAt, forwardEnd], [0, last], clamp);
  }
  const reading = frame >= readAt;

  const litAt = (i: number): number | null => {
    if (!reading) return null;
    if (replaying) {
      if (i <= target) return readAt + i * step;
      const at = (replayAt as number) + (i - target) * step;
      return frame >= at ? at : null;
    }
    if (i > pos + 1e-6) return null;
    return readAt + i * step;
  };

  const litCount = Math.round(Math.max(0, pos)) + 1;
  const showOffset = offsetAt !== undefined && frame >= offsetAt;
  const readout = showOffset
    ? interpolate(
        frame,
        [offsetAt as number, (offsetAt as number) + dur.block],
        [1, litCount],
        {...clamp, easing: ease.out},
      )
    : 0;
  const fade = (at: number | undefined) =>
    at === undefined ? 0 : interpolate(frame, [at, at + dur.micro], [0, 1], clamp);

  const cellX = (i: number) => i * (cellW + gap);
  const cursorX = cellX(pos) + cellW / 2;

  return (
    <div style={{position: 'relative', width, height}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top,
          height: headerH,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <span style={{...t.dataLabel, opacity: fade(retentionAt)}}>RETENTION</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: dur.elem,
            opacity: fade(offsetAt),
          }}
        >
          <span style={t.dataLabel}>OFFSET</span>
          <span style={{...t.readout, color: color.ink}}>{Math.round(readout)}</span>
        </span>
      </div>

      {Array.from({length: cells}, (_, i) => {
        const onset = i * dur.stagger;
        const visible = frame >= onset;
        const lit = litAt(i);
        const on = lit !== null;
        const scale =
          (visible ? 0.9 + pop(frame, onset) * 0.1 : 0) *
          (on ? 0.9 + pop(frame, lit) * 0.1 : 1);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cellX(i),
              top: cellsY,
              width: cellW,
              height: cellW,
              boxSizing: 'border-box',
              borderRadius: shape.slot.radius,
              border: `${shape.slot.border}px solid ${on ? color.ink : color.line}`,
              backgroundColor: on ? fill : 'transparent',
              boxShadow: on ? shape.slot.shadow : 'none',
              transform: `scale(${scale})`,
              opacity: visible ? 1 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: t.lead.fontSize,
              color: on ? color.ink : color.muted,
            }}
          >
            {i + 1}
          </div>
        );
      })}

      {reading ? (
        <div
          style={{
            position: 'absolute',
            // ширина ноль: и остриё, и подпись центруются по курсору, а не
            // по ширине подписи, иначе у последней ячейки уезжают за кадр
            left: cursorX,
            width: 0,
            top: cursorY,
            transform: `scale(${pop(frame, readAt)})`,
            transformOrigin: 'center top',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${HEAD_W / 2}px solid transparent`,
              borderRight: `${HEAD_W / 2}px solid transparent`,
              borderBottom: `${HEAD_L}px solid ${color.ink}`,
            }}
          />
          <div
            style={{
              ...t.dataLabel,
              color: color.ink,
              marginTop: dur.micro,
              whiteSpace: 'nowrap',
            }}
          >
            CONSUMER
          </div>
        </div>
      ) : null}
    </div>
  );
};
