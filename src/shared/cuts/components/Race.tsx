import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, pop, shape, type as t} from '../../motion/theme';
import {Arrow} from './Arrow';
import {Node} from './Node';
import type {RaceRequest, RaceSpec} from '../types';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

/** Узел — полный слот; если колонка не влезает в область, ужимается. */
const NODE_MAX = shape.slot.size;
const PACKET = shape.slot.size / 3;
/** Зазор между серверами в колонке: больше офсетной тени. */
const GAP = dur.beat;
const FRAME_PAD = dur.beat;
const LABEL_H = t.dataLabel.fontSize + dur.micro;
/** Плашка над схемой (ДОЛЬШЕ P95, ЧЕРЕЗ 10 МС). */
const BADGE_H = shape.slot.size / 2;
const PAD = dur.beat;
/** Крестик отмены — по размеру ячейки запроса. */
const CROSS = PACKET / 2;
/** Приглушённый узел: «остальное — opacity .4» из хендоффа. */
const DIM = 0.4;

type Pt = {x: number; y: number};

/**
 * Веер запросов и хеджирование. Клиент слева, справа колонка серверов —
 * сервисы, в которые ходит клиент, или инстансы одного сервиса, тогда
 * вокруг них рамка с подписью. От клиента к каждому серверу стрелка:
 * `line`, пока по ней ничего не прошло, `ink` после первого запроса.
 * Запрос — ячейка тона перебивки, летит `travel` кадров; пока он в сервере,
 * сервер залит — «обрабатывает». Ответ летит по той же стрелке обратно,
 * клиент на блок залит — «получил» (только в перебивке-ответе: в проблеме
 * клиент заливается на `waitAt` — ждёт самого медленного).
 * Сервер, который висит: в перебивке-проблеме залит alarm, в перебивке-ответе
 * приглушён. Отменённый запрос — крестик на стрелке, сервер гаснет.
 *
 * Отклонение от §8 хендоффа то же, что у потока и клиент-сервера: запросы
 * и события заданы кадрами в данных, а не вложенными `Sequence`.
 */
export const Race: React.FC<
  RaceSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({
  client,
  servers,
  frame: frameLabel,
  at = 0,
  requests,
  waitAt,
  badge,
  travel = dur.beat,
  tone,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;

  // --- раскладка ---------------------------------------------------------------
  const clientW = Math.round(width * 0.32);
  const serverW = Math.round(width * 0.36);
  const top = badge ? BADGE_H : 0;
  const areaH = height - top;
  const cy = top + areaH / 2;
  const n = servers.length;
  const extra = frameLabel ? FRAME_PAD * 2 + LABEL_H : 0;
  const NODE_H = Math.min(NODE_MAX, (areaH - extra - (n - 1) * GAP) / n);
  const colH = n * NODE_H + (n - 1) * GAP;
  const boxH = colH + extra;
  const boxY = top + (areaH - boxH) / 2;
  const colY = frameLabel ? boxY + FRAME_PAD + LABEL_H : boxY;
  const serverX = width - serverW - (frameLabel ? FRAME_PAD : 0);
  const boxX = frameLabel ? serverX - FRAME_PAD : serverX;
  const boxW = frameLabel ? serverW + FRAME_PAD * 2 : serverW;
  /** правая кромка клиента; стрелки упираются в рамку, если она есть */
  const x0 = clientW;
  const x1 = boxX;
  const serverY = (i: number) => colY + i * (NODE_H + GAP);
  const origin: Pt = {x: x0, y: cy};
  const target = (i: number): Pt => ({x: x1, y: serverY(i) + NODE_H / 2});

  // --- появление ---------------------------------------------------------------
  const clientAt = at;
  const boxAt = at + dur.elem;
  const serverAt = (i: number) => boxAt + i * dur.stagger;
  const visible = (f: number) => frame >= f;
  const popScale = (f: number) => (visible(f) ? 0.9 + pop(frame, f) * 0.1 : 0);
  const grow = (f: number) =>
    interpolate(frame, [f, f + dur.block], [0, 1], {...clamp, easing: ease.out});

  // --- запросы -------------------------------------------------------------------
  const along = (from: Pt, to: Pt, u: number): Pt => ({
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
  });
  const packets: {p: Pt; scale: number}[] = [];
  const state = servers.map(() => ({
    busy: false,
    busyAt: -1,
    hung: false,
    hungAt: -1,
    cancelled: false,
    cancelledAt: -1,
    departed: false,
  }));
  let clientFlash: number | null = null;
  /** первый ответ, пришедший после waitAt, снимает ожидание */
  let waitUntil = Infinity;

  const cancelledAt = (r: RaceRequest) => r.cancelAt ?? Infinity;
  const hungAt = (r: RaceRequest) => r.hangAt ?? Infinity;
  const repliedAt = (r: RaceRequest) => r.replyAt ?? Infinity;

  for (const r of requests) {
    const s = state[r.to];
    if (!s) continue;
    const arrive = r.at + travel;
    if (frame >= r.at) s.departed = true;
    if (frame >= r.at && frame <= arrive) {
      const u = interpolate(frame, [r.at, arrive], [0, 1], {
        ...clamp,
        easing: ease.travel,
      });
      packets.push({p: along(origin, target(r.to), u), scale: pop(frame, r.at)});
    }
    const inside = frame > arrive && frame < Math.min(repliedAt(r), hungAt(r), cancelledAt(r));
    if (inside) {
      s.busy = true;
      s.busyAt = Math.max(s.busyAt, arrive);
    }
    if (frame >= hungAt(r) && frame < cancelledAt(r)) {
      s.hung = true;
      s.hungAt = Math.max(s.hungAt, hungAt(r));
    }
    if (frame >= cancelledAt(r)) {
      s.cancelled = true;
      s.cancelledAt = Math.max(s.cancelledAt, cancelledAt(r));
    }
    if (r.replyAt !== undefined) {
      const back = r.replyAt + travel;
      if (frame >= r.replyAt && frame <= back) {
        const u = interpolate(frame, [r.replyAt, back], [0, 1], {
          ...clamp,
          easing: ease.travel,
        });
        packets.push({p: along(target(r.to), origin, u), scale: pop(frame, r.replyAt)});
      }
      if (waitAt !== undefined && back > waitAt) waitUntil = Math.min(waitUntil, back);
      if (tone === 'accent' && frame > back && frame < back + dur.block) {
        clientFlash = Math.max(clientFlash ?? -1, back);
      }
    }
  }

  const waiting = waitAt !== undefined && frame >= waitAt && frame < waitUntil;
  const clientLit = waiting ? waitAt : clientFlash;

  // --- плашка ------------------------------------------------------------------
  const badgeOn = badge !== undefined && frame >= badge.at;

  return (
    <div style={{position: 'relative', width, height}}>
      {badgeOn ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height: BADGE_H,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              height: BADGE_H,
              padding: `0 ${PAD}px`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              borderRadius: shape.meter.radius,
              border: `${shape.meter.border}px solid ${color.ink}`,
              backgroundColor: fill,
              boxShadow: shape.slot.shadow,
              transform: `scale(${0.9 + pop(frame, (badge as {at: number}).at) * 0.1})`,
              ...t.dataLabel,
              letterSpacing: '0.08em',
              color: color.ink,
            }}
          >
            {(badge as {label: string}).label}
          </div>
        </div>
      ) : null}

      <svg
        width={width}
        height={height}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        {servers.map((_, i) => {
          const s = state[i];
          const onset = serverAt(i);
          if (!visible(onset)) return null;
          const to = target(i);
          const mid = along(origin, to, 0.5);
          return (
            <g key={i} opacity={s.cancelled ? DIM : 1}>
              <Arrow
                from={origin}
                to={to}
                progress={grow(onset)}
                active={s.departed && !s.cancelled}
              />
              {s.cancelled ? (
                <g
                  transform={`translate(${mid.x} ${mid.y}) scale(${pop(frame, s.cancelledAt)})`}
                >
                  <rect
                    x={-CROSS - dur.micro}
                    y={-CROSS - dur.micro}
                    width={(CROSS + dur.micro) * 2}
                    height={(CROSS + dur.micro) * 2}
                    fill={color.paper}
                  />
                  <line
                    x1={-CROSS}
                    y1={-CROSS}
                    x2={CROSS}
                    y2={CROSS}
                    stroke={color.ink}
                    strokeWidth={shape.meter.border}
                    strokeLinecap="round"
                  />
                  <line
                    x1={CROSS}
                    y1={-CROSS}
                    x2={-CROSS}
                    y2={CROSS}
                    stroke={color.ink}
                    strokeWidth={shape.meter.border}
                    strokeLinecap="round"
                  />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      {frameLabel ? (
        <div
          style={{
            position: 'absolute',
            left: boxX,
            top: boxY,
            width: boxW,
            height: boxH,
            boxSizing: 'border-box',
            padding: FRAME_PAD,
            borderRadius: shape.slot.radius,
            border: `${shape.slot.border}px solid ${color.ink}`,
            opacity: visible(boxAt) ? 1 : 0,
            transform: `scale(${popScale(boxAt)})`,
            ...t.dataLabel,
            lineHeight: `${t.dataLabel.fontSize}px`,
            whiteSpace: 'nowrap',
            color: color.ink,
          }}
        >
          {frameLabel}
        </div>
      ) : null}

      <div style={{position: 'absolute', left: 0, top: cy - NODE_H / 2}}>
        <Node
          label={client}
          width={clientW}
          height={NODE_H}
          fill={clientLit !== null ? fill : null}
          scale={
            popScale(clientAt) *
            (clientLit !== null ? 0.9 + pop(frame, clientLit) * 0.1 : 1)
          }
          opacity={visible(clientAt) ? 1 : 0}
        />
      </div>

      {servers.map((label, i) => {
        const s = state[i];
        const onset = serverAt(i);
        // висит: в проблеме — alarm, в ответе — приглушён; отменён — гаснет
        const hungFill = tone === 'alarm' ? color.alarm : null;
        const nodeFill = s.cancelled ? null : s.hung ? hungFill : s.busy ? fill : null;
        const dim = s.cancelled || (s.hung && tone !== 'alarm');
        const litAt = s.cancelled ? s.cancelledAt : s.hung ? s.hungAt : s.busy ? s.busyAt : null;
        return (
          <div key={i} style={{position: 'absolute', left: serverX, top: serverY(i)}}>
            <Node
              label={label}
              width={serverW}
              height={NODE_H}
              fill={nodeFill}
              scale={popScale(onset) * (litAt !== null ? 0.9 + pop(frame, litAt) * 0.1 : 1)}
              opacity={visible(onset) ? (dim ? DIM : 1) : 0}
            />
          </div>
        );
      })}

      {packets.map((v, k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: v.p.x - PACKET / 2,
            top: v.p.y - PACKET / 2,
            width: PACKET,
            height: PACKET,
            boxSizing: 'border-box',
            borderRadius: shape.slot.radius / 3,
            border: `${shape.slot.border}px solid ${color.ink}`,
            backgroundColor: fill,
            transform: `scale(${v.scale})`,
          }}
        />
      ))}
    </div>
  );
};
