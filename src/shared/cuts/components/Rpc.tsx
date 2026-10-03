import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, pop, shape, type as t} from '../../motion/theme';
import {Arrow} from './Arrow';
import {Node} from './Node';
import type {RpcSpec} from '../types';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const NODE_H = shape.slot.size;
const PACKET = shape.slot.size / 3;
/** Полосы запроса и ответа: расстояние между ними. */
const LANE_GAP = shape.slot.size * 0.8;
/** Полоса режима над схемой. */
const MODE_H = shape.slot.size / 2;
const PAD = dur.beat;
const LABEL_H = t.dataLabel.fontSize + dur.micro;
/** Полуразмах крестика потерянного сообщения — как у отмены в гонке. */
const CROSS = PACKET / 2;
/** Строка журнала под сервером. */
const ROW_FONT = t.dataLabel.fontSize * 1.2;
const ROW_H = ROW_FONT * 2;

/**
 * Клиент и сервер друг напротив друга, между ними две полосы: запрос слева
 * направо, ответ справа налево. Полоса — `line`, пока по ней ничего не
 * прошло, `ink` после первого сообщения. Сообщение — ячейка тона перебивки,
 * летит `travel` кадров; узел, в который оно пришло, на блок залит —
 * «обрабатывает». Рамка канала (HTTP/2) — постоянное соединение вокруг
 * обеих полос. Режим (UNARY, STREAMING…) — плашка над схемой, сменяется
 * по кадрам. Потерянное сообщение встаёт у сервера, на пятой части полосы, там
 * остаётся крестик. Журнал под сервером — что сервер у себя записал:
 * строка появляется, а когда сервер находит её снова (`hitAt`), на блок
 * заливается.
 *
 * Отклонение от §8 хендоффа то же, что у потока: сообщения и режимы заданы
 * кадрами в данных, а не вложенными `Sequence`.
 */
export const Rpc: React.FC<
  RpcSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({
  client,
  server,
  reqLabel = 'REQUEST',
  resLabel = 'RESPONSE',
  channel,
  channelAt = 0,
  modes = [],
  messages,
  travel = dur.beat,
  ledger,
  wait,
  tone,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;

  const nodeW = Math.round(width / 4);
  // режим — полоса сверху, узлы и полосы — по центру остатка
  const cy = MODE_H + (height - MODE_H) / 2;
  const nodeY = cy - NODE_H / 2;
  const reqY = cy - LANE_GAP / 2;
  const resY = cy + LANE_GAP / 2;
  /** правая кромка клиента и левая кромка сервера */
  const x0 = nodeW;
  const x1 = width - nodeW;

  const clientAt = 0;
  const serverAt = dur.stagger;
  const lanesAt = serverAt + dur.micro;
  const visible = (at: number) => frame >= at;
  const popScale = (at: number) =>
    visible(at) ? 0.9 + pop(frame, at) * 0.1 : 0;

  // --- сообщения -------------------------------------------------------------
  let firstReq = Infinity;
  let firstRes = Infinity;
  for (const m of messages) {
    if (m.dir === 'req') firstReq = Math.min(firstReq, m.at);
    else firstRes = Math.min(firstRes, m.at);
  }
  const packets: {x: number; y: number; scale: number; label?: string}[] = [];
  const crosses: {x: number; y: number; at: number}[] = [];
  let clientLit: number | null = null;
  let serverLit: number | null = null;
  for (const m of messages) {
    // потерянное летит пятую часть пути и там пропадает
    const arrive = m.at + (m.lost ? Math.round(travel * 0.2) : travel);
    if (frame < m.at) continue;
    const y = m.dir === 'req' ? reqY : resY;
    const start = m.dir === 'req' ? x0 + PACKET / 2 : x1 - PACKET / 2;
    const end = m.dir === 'req' ? x1 - PACKET / 2 : x0 + PACKET / 2;
    // теряется на пятой части пути, чтобы крестик не садился на подпись полосы
    const reach = m.lost ? 0.2 : 1;
    if (frame <= arrive) {
      const u = interpolate(frame, [m.at, arrive], [0, reach], {
        ...clamp,
        easing: ease.travel,
      });
      packets.push({
        x: start + (end - start) * u,
        y,
        scale: pop(frame, m.at),
        label: m.label,
      });
    } else if (m.lost) {
      crosses.push({x: start + (end - start) * reach, y, at: arrive});
    } else if (frame < arrive + dur.block) {
      // пришло — узел залит на блок, последний приход задаёт вспышку
      if (m.dir === 'req') serverLit = Math.max(serverLit ?? -1, arrive);
      else clientLit = Math.max(clientLit ?? -1, arrive);
    }
  }

  // --- ожидание клиента ------------------------------------------------------
  // ждёт до первого дошедшего ответа после `wait.at`
  const waitEnd = wait
    ? Math.min(
        ...messages
          .filter((m) => m.dir === 'res' && !m.lost && m.at >= wait.at)
          .map((m) => m.at + travel),
        Infinity,
      )
    : -1;
  const waiting = wait !== undefined && frame >= wait.at && frame < waitEnd;
  if (waiting && clientLit === null) clientLit = wait.at;
  // точки бегут по одной в полсекунды: «ждёт ответ.», «..», «...»
  const dots = waiting ? '.'.repeat(1 + (Math.floor((frame - wait.at) / 15) % 3)) : '';

  // --- режим -------------------------------------------------------------------
  let mode: {at: number; label: string} | null = null;
  for (const m of modes) if (frame >= m.at) mode = m;

  const laneProgress = interpolate(
    frame,
    [lanesAt, lanesAt + dur.block],
    [0, 1],
    {...clamp, easing: ease.out},
  );
  const channelOn = channel !== undefined && frame >= channelAt;
  const channelIn = interpolate(
    frame,
    [channelAt, channelAt + dur.elem],
    [0, 1],
    clamp,
  );
  // рамка канала — с запасом над подписями полос, чтобы её подпись не садилась на REQUEST
  const chanTop = reqY - LABEL_H - PAD * 1.5;
  const chanBottom = resY + LABEL_H + PAD * 1.5;

  const node = (
    label: string,
    x: number,
    at: number,
    lit: number | null,
  ) => (
    <div style={{position: 'absolute', left: x, top: nodeY}}>
      <Node
        label={label}
        width={nodeW}
        height={NODE_H}
        fill={lit !== null ? fill : null}
        scale={popScale(at) * (lit !== null ? 0.9 + pop(frame, lit) * 0.1 : 1)}
        opacity={visible(at) ? 1 : 0}
      />
    </div>
  );

  const laneLabel = (text: string, top: number) => (
    <div
      style={{
        position: 'absolute',
        left: x0,
        width: x1 - x0,
        top,
        textAlign: 'center',
        opacity: laneProgress,
        ...t.dataLabel,
        lineHeight: `${t.dataLabel.fontSize}px`,
      }}
    >
      {text}
    </div>
  );

  return (
    <div style={{position: 'relative', width, height}}>
      {mode ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height: MODE_H,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            key={mode.at}
            style={{
              height: MODE_H,
              padding: `0 ${PAD}px`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              borderRadius: shape.meter.radius,
              border: `${shape.meter.border}px solid ${color.ink}`,
              backgroundColor: fill,
              boxShadow: shape.slot.shadow,
              transform: `scale(${0.9 + pop(frame, mode.at) * 0.1})`,
              ...t.dataLabel,
              letterSpacing: '0.08em',
              color: color.ink,
            }}
          >
            {mode.label}
          </div>
        </div>
      ) : null}

      <svg
        width={width}
        height={height}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        {channelOn ? (
          <rect
            x={x0 + PAD / 2}
            y={chanTop}
            width={x1 - x0 - PAD}
            height={chanBottom - chanTop}
            rx={shape.slot.radius}
            fill="none"
            stroke={color.ink}
            strokeWidth={shape.meter.border}
            opacity={channelIn}
          />
        ) : null}
        {visible(lanesAt) ? (
          <>
            <Arrow
              from={{x: x0, y: reqY}}
              to={{x: x1, y: reqY}}
              progress={laneProgress}
              active={frame >= firstReq}
            />
            <Arrow
              from={{x: x1, y: resY}}
              to={{x: x0, y: resY}}
              progress={laneProgress}
              active={frame >= firstRes}
            />
          </>
        ) : null}
        {crosses.map((c, k) => (
          <g
            key={k}
            transform={`translate(${c.x} ${c.y}) scale(${pop(frame, c.at)})`}
          >
            <rect
              x={-CROSS - dur.micro}
              y={-CROSS - dur.micro}
              width={(CROSS + dur.micro) * 2}
              height={(CROSS + dur.micro) * 2}
              fill={color.paper}
            />
            {[1, -1].map((d) => (
              <line
                key={d}
                x1={-CROSS}
                y1={-CROSS * d}
                x2={CROSS}
                y2={CROSS * d}
                stroke={color.alarm}
                strokeWidth={shape.meter.border * 1.5}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </svg>

      {laneLabel(reqLabel, reqY - LABEL_H)}
      {laneLabel(resLabel, resY + dur.micro)}

      {channelOn ? (
        // подпись канала сидит на верхней кромке рамки, бумага перекрывает линию
        <div
          style={{
            position: 'absolute',
            left: (x0 + x1) / 2,
            top: chanTop,
            transform: `translate(-50%, -50%) scale(${0.9 + pop(frame, channelAt) * 0.1})`,
            padding: `0 ${dur.elem}px`,
            backgroundColor: color.paper,
            whiteSpace: 'nowrap',
            ...t.dataLabel,
            letterSpacing: '0.08em',
            lineHeight: `${t.dataLabel.fontSize}px`,
            color: color.ink,
          }}
        >
          {channel}
        </div>
      ) : null}

      {node(client, 0, clientAt, clientLit)}
      {waiting ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: nodeW * 1.5,
            top: nodeY + NODE_H + PAD,
            opacity: interpolate(frame, [wait.at, wait.at + dur.elem], [0, 1], clamp),
            ...t.dataLabel,
            lineHeight: `${t.dataLabel.fontSize}px`,
            color: color.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {wait.label}
          {dots}
        </div>
      ) : null}
      {node(server, x1, serverAt, serverLit)}

      {ledger ? (
        <div
          style={{
            position: 'absolute',
            // журнал — от середины полос до правого края, строки в одну линию
            left: width - nodeW * 2,
            width: nodeW * 2,
            top: nodeY + NODE_H + PAD,
            opacity: visible(serverAt) ? 1 : 0,
          }}
        >
          <div
            style={{
              ...t.dataLabel,
              lineHeight: `${t.dataLabel.fontSize}px`,
              textAlign: 'center',
              marginBottom: dur.elem,
            }}
          >
            {ledger.title}
          </div>
          {ledger.rows.map((r, k) => {
            if (!visible(r.at)) return null;
            const litAt = [r.at, r.hitAt ?? -1]
              .filter((a) => a >= 0 && frame >= a && frame < a + dur.block * 2)
              .at(-1);
            return (
              <div
                key={k}
                style={{
                  height: ROW_H,
                  marginBottom: dur.micro,
                  boxSizing: 'border-box',
                  borderRadius: shape.slot.radius / 3,
                  border: `${shape.slot.border}px solid ${color.ink}`,
                  backgroundColor: litAt !== undefined ? fill : color.paper,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${0.9 + pop(frame, litAt ?? r.at) * 0.1})`,
                  ...t.code,
                  fontSize: ROW_FONT,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  color:
                    litAt !== undefined && fill !== color.accent
                      ? color.paper
                      : color.ink,
                }}
              >
                {r.text}
              </div>
            );
          })}
        </div>
      ) : null}

      {packets.map((v, k) =>
        v.label ? (
          <div
            key={`l${k}`}
            style={{
              position: 'absolute',
              left: v.x,
              top: v.y + (v.y === reqY ? -PACKET / 2 - LABEL_H * 1.6 : PACKET / 2 + dur.micro),
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              ...t.code,
              fontWeight: 600,
              lineHeight: `${t.dataLabel.fontSize}px`,
              color: color.ink,
            }}
          >
            {v.label}
          </div>
        ) : null,
      )}
      {packets.map((v, k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: v.x - PACKET / 2,
            top: v.y - PACKET / 2,
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
