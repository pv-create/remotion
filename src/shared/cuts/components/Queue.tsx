import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, font, pop, shape, type as t} from '../../motion/theme';
import {Node} from './Node';
import type {QueueSpec} from '../types';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

/** Ёмкость очереди: столько сообщений помещается в дорожку. */
const CAP = 5;

/** Стрелка «очередь читают». Форма без скруглений, цвет — только ink/line. */
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

/**
 * Очередь RabbitMQ: дорожка с подписанными сообщениями, стрелка, консьюмер.
 * Первое сообщение уезжает к консьюмеру, над ним встаёт бейдж ACK, потом
 * сообщение схлопывается, а очередь сдвигается на его место. Показывает
 * главное: после обработки сообщения в очереди больше нет.
 */
export const Queue: React.FC<
  QueueSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({cells, consumer, deliverAt, ackAt, dropAt, tone, width, height}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;

  const trackH = shape.slot.size * 0.72;
  const border = shape.meter.border;
  const gapX = dur.elem + dur.micro;
  const arrowW = dur.beat * 2;
  const consumerW = shape.slot.size * 2 + dur.beat;
  const trackW = width - gapX * 2 - arrowW - consumerW;
  const cellPad = dur.micro;
  const cellGap = dur.micro;
  const cellW = (trackW - border * 2 - cellPad * 2 - cellGap * (CAP - 1)) / CAP;
  const cellH = trackH - border * 2 - cellPad * 2;

  const labelH = t.dataLabel.fontSize + dur.elem;
  const top = (height - labelH - trackH) / 2;
  const trackY = top + labelH;
  const consumerX = trackW + gapX + arrowW + gapX;

  const cellX = (i: number) => border + cellPad + i * (cellW + cellGap);
  const cellY = trackY + border + cellPad;
  const consumerCenterX = consumerX + consumerW / 2 - cellW / 2;

  const delivered = frame >= deliverAt;
  const acked = frame >= ackAt;
  const dropped = frame >= dropAt;

  // первое сообщение едет к консьюмеру, потом схлопывается
  const travel = interpolate(frame, [deliverAt, deliverAt + dur.beat], [0, 1], {
    ...clamp,
    easing: ease.travel,
  });
  const gone = interpolate(frame, [dropAt, dropAt + dur.elem], [1, 0], {
    ...clamp,
    easing: ease.out,
  });
  // остальные подтягиваются на освободившееся место
  const shift = interpolate(frame, [dropAt, dropAt + dur.beat], [0, 1], {
    ...clamp,
    easing: ease.out,
  });

  const badgeH = t.kicker.fontSize + dur.block * 2;
  // сообщение доехало и лежит на консьюмере — подпись под ним не читается,
  // прячем её до тех пор, пока сообщение не схлопнется
  const inside = frame >= deliverAt + dur.beat && !(dropped && gone === 0);

  return (
    <div style={{position: 'relative', width, height}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top,
          ...t.dataLabel,
          color: color.ink,
          letterSpacing: '0.08em',
        }}
      >
        QUEUE
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: trackY,
          width: trackW,
          height: trackH,
          boxSizing: 'border-box',
          borderRadius: shape.meter.radius,
          border: `${border}px solid ${color.ink}`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: trackW + gapX,
          top: trackY,
          height: trackH,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Arrow width={arrowW} active={delivered} />
      </div>

      <div style={{position: 'absolute', left: consumerX, top: trackY}}>
        <Node
          label={inside ? '' : consumer}
          width={consumerW}
          height={trackH}
          scale={0.9 + pop(frame, dur.elem) * 0.1}
          opacity={frame >= dur.elem ? 1 : 0}
        />
      </div>

      {cells.map((label, i) => {
        const onset = i * dur.stagger;
        const visible = frame >= onset;
        const head = i === 0;
        const x = head
          ? cellX(0) + (consumerCenterX - cellX(0)) * travel
          : cellX(i) - (cellW + cellGap) * shift;
        const scale =
          (visible ? 0.9 + pop(frame, onset) * 0.1 : 0) * (head ? gone : 1);
        if (head && dropped && gone === 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: cellY,
              width: cellW,
              height: cellH,
              boxSizing: 'border-box',
              borderRadius: shape.slot.radius / 2,
              border: `${shape.slot.border}px solid ${color.ink}`,
              backgroundColor: fill,
              boxShadow: head && delivered ? shape.slot.shadow : 'none',
              transform: `scale(${scale})`,
              opacity: visible ? 1 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: t.lead.fontSize,
              color: color.ink,
              zIndex: head ? 1 : 0,
            }}
          >
            {label}
          </div>
        );
      })}

      {acked ? (
        <div
          style={{
            position: 'absolute',
            left: consumerX,
            width: consumerW,
            top: trackY - badgeH - dur.elem,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: color.ink,
              color: color.paper,
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: t.kicker.fontSize,
              letterSpacing: t.dataLabel.letterSpacing,
              textTransform: 'uppercase',
              padding: `${dur.block}px ${dur.beat}px`,
              borderRadius: dur.stagger * 4,
              transform: `scale(${pop(frame, ackAt)})`,
              opacity: pop(frame, ackAt),
            }}
          >
            ACK
          </div>
        </div>
      ) : null}
    </div>
  );
};
