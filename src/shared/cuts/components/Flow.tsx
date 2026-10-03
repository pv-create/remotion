import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, pop, shape, type as t} from '../../motion/theme';
import {Node} from './Node';
import type {FlowPacket, FlowSpec, FlowStep, FlowTier} from '../types';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

/** Ёмкость очереди: столько ячеек помещается в узел-очередь. */
const CAP = 5;
/** Остриё стрелки — те же пропорции, что у CSS-стрелок дорожек и пулов. */
const HEAD_L = dur.elem * 2;
const HEAD_W = dur.elem * 1.4 * 2;

const NODE_H = shape.slot.size * 0.72;
const CELL_H = shape.slot.size / 2;
const PAD = dur.elem;
const QUEUE_H = PAD * 2 + t.dataLabel.fontSize + dur.micro + CELL_H;
const FRAME_PAD = dur.beat;
const PACKET = shape.slot.size / 3;

type Box = {x: number; y: number; w: number; h: number};
type TierLayout = {frame: Box | null; nodes: Box[]};

const center = (b: Box) => ({x: b.x + b.w / 2, y: b.y + b.h / 2});
const bottom = (b: Box) => ({x: b.x + b.w / 2, y: b.y + b.h});
const top = (b: Box) => ({x: b.x + b.w / 2, y: b.y});
/** Середина ряда ячеек в узле-очереди: туда прилетает сообщение, не на подпись. */
const cellsCenter = (b: Box) => ({
  x: b.x + b.w / 2,
  y: b.y + PAD + t.dataLabel.fontSize + dur.micro + CELL_H / 2,
});

const tierHeight = (tier: FlowTier) => {
  const nodeH = tier.queue ? QUEUE_H : NODE_H;
  return tier.frame
    ? FRAME_PAD * 2 + t.dataLabel.fontSize + dur.micro + nodeH
    : nodeH;
};

/** Ярусы сверху вниз с равными зазорами; узлы яруса — по центру ряда. */
const layout = (tiers: FlowTier[], width: number, height: number): TierLayout[] => {
  const heights = tiers.map(tierHeight);
  const total = heights.reduce((a, b) => a + b, 0);
  const gap = tiers.length > 1 ? (height - total) / (tiers.length - 1) : 0;
  let y = tiers.length > 1 ? 0 : (height - total) / 2;
  return tiers.map((tier, i) => {
    const h = heights[i];
    const nodeH = tier.queue ? QUEUE_H : NODE_H;
    const gapX = dur.beat;
    const innerX = tier.frame ? FRAME_PAD : 0;
    const innerW = width - innerX * 2;
    const n = tier.nodes.length;
    // одиночный узел не растягивается на всю ширину — блок, а не полоса
    const w = Math.min((innerW - gapX * (n - 1)) / n, n === 1 ? width / 2 : innerW);
    const rowW = w * n + gapX * (n - 1);
    const x0 = innerX + (innerW - rowW) / 2;
    const nodeY = tier.frame ? y + FRAME_PAD + t.dataLabel.fontSize + dur.micro : y;
    const nodes = tier.nodes.map((_, j) => ({
      x: x0 + j * (w + gapX),
      y: nodeY,
      w,
      h: nodeH,
    }));
    const frame = tier.frame ? {x: 0, y, w: width, h} : null;
    y += h + gap;
    return {frame, nodes};
  });
};

/** Кадр включения узла: шаг, где счётчик впервые перекрыл его номер, плюс каскад. */
const onsetOf = (
  steps: FlowStep[],
  index: number,
  count: (s: FlowStep) => number,
) => {
  for (let k = 0; k < steps.length; k++) {
    if (count(steps[k]) > index) {
      const before = k > 0 ? count(steps[k - 1]) : 0;
      return steps[k].at + (index - before) * dur.stagger;
    }
  }
  return null;
};

/** Кадр, с которого узел последнего яруса читает: первый шаг, где он в reading. */
const readingOnset = (steps: FlowStep[], index: number) => {
  for (const s of steps) {
    const pos = (s.reading ?? []).indexOf(index);
    if (pos >= 0) return s.at + pos * dur.stagger;
  }
  return null;
};

/** Сегменты пути сообщения: k-й — переезд с яруса k на k+1. */
const segmentsOf = (p: FlowPacket, dwell: number) => {
  const segs: {from: number; to: number}[] = [];
  let start = p.at + dur.elem;
  for (let k = 0; k < p.route.length - 1; k++) {
    segs.push({from: start, to: start + dur.beat});
    start += dur.beat + (p.dwell ?? dwell);
  }
  return segs;
};

const Edge: React.FC<{
  from: {x: number; y: number};
  to: {x: number; y: number};
  progress: number;
  active: boolean;
}> = ({from, to, progress, active}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // линия останавливается у основания острия, остриё упирается в узел
  const base = {x: to.x - ux * HEAD_L, y: to.y - uy * HEAD_L};
  const end = {
    x: from.x + (base.x - from.x) * progress,
    y: from.y + (base.y - from.y) * progress,
  };
  const px = -uy * (HEAD_W / 2);
  const py = ux * (HEAD_W / 2);
  const stroke = active ? color.ink : color.line;
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={end.x}
        y2={end.y}
        stroke={stroke}
        strokeWidth={shape.meter.border}
        strokeLinecap="round"
      />
      <polygon
        points={`${to.x},${to.y} ${base.x + px},${base.y + py} ${base.x - px},${base.y - py}`}
        fill={stroke}
        opacity={progress}
      />
    </g>
  );
};

/**
 * Поток сообщений по ярусам. Стрелки — `line`, пока по ним ничего не прошло,
 * `ink` после первого сообщения или когда узел на конце читает. Сообщение —
 * ячейка тона перебивки: выходит из первого яруса, стоит в промежуточном узле
 * (узел на это время залит — «решает»), в очереди ложится ячейкой.
 *
 * Отклонение от §8 хендоффа то же, что у дорожек и пулов: шаги и сообщения
 * заданы кадрами в данных, а не вложенными `Sequence`, — узлы живут через
 * всю перебивку.
 */
export const Flow: React.FC<
  FlowSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({tiers, steps, packets, dwell = dur.hold, tone, width, height}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;
  const L = layout(tiers, width, height);
  const last = tiers.length - 1;

  const countOf = (i: number) => (s: FlowStep) => s.open[i] ?? 0;
  const nodeOnset = (i: number, j: number) => onsetOf(steps, j, countOf(i));
  const tierOnset = (i: number) => nodeOnset(i, 0);
  const visibleAt = (onset: number | null) => onset !== null && frame >= onset;
  const popScale = (onset: number | null) =>
    visibleAt(onset) ? 0.9 + pop(frame, onset as number) * 0.1 : 0;

  const scheduled = packets.map((p) => ({p, segs: segmentsOf(p, dwell)}));

  // --- стрелки ---------------------------------------------------------------
  const edges: {
    from: {x: number; y: number};
    to: {x: number; y: number};
    onset: number | null;
    activeAt: number | null;
  }[] = [];
  for (let i = 0; i < last; i++) {
    const src = L[i].frame
      ? [{box: L[i].frame as Box, idx: -1}]
      : L[i].nodes.map((box, a) => ({box, idx: a}));
    const dst = L[i + 1].frame
      ? [{box: L[i + 1].frame as Box, idx: -1}]
      : L[i + 1].nodes.map((box, b) => ({box, idx: b}));
    for (const s of src) {
      for (const d of dst) {
        const so = s.idx < 0 ? tierOnset(i) : nodeOnset(i, s.idx);
        const dO = d.idx < 0 ? tierOnset(i + 1) : nodeOnset(i + 1, d.idx);
        const onset = so === null || dO === null ? null : Math.max(so, dO);
        let activeAt: number | null = null;
        for (const {p, segs} of scheduled) {
          const seg = segs[i];
          if (!seg) continue;
          if (s.idx >= 0 && p.route[i] !== s.idx) continue;
          if (d.idx >= 0 && p.route[i + 1] !== d.idx) continue;
          activeAt = activeAt === null ? seg.from : Math.min(activeAt, seg.from);
        }
        if (i + 1 === last && d.idx >= 0) {
          const r = readingOnset(steps, d.idx);
          if (r !== null) activeAt = activeAt === null ? r : Math.min(activeAt, r);
        }
        edges.push({from: bottom(s.box), to: top(d.box), onset, activeAt});
      }
    }
  }

  // --- сообщения -------------------------------------------------------------
  const landed: Map<string, number[]> = new Map();
  const packetViews: {x: number; y: number; scale: number}[] = [];
  const held: Map<string, number> = new Map();
  for (const {p, segs} of scheduled) {
    if (frame < p.at) continue;
    // сегмент k: из нижней кромки узла k в верхнюю кромку узла k+1;
    // в очередь — в её середину, там сообщение становится ячейкой
    const boxes = p.route.map((j, k) => L[k].nodes[j]);
    const exits = boxes.map(bottom);
    const entries = boxes.map((b, k) =>
      tiers[k].queue ? cellsCenter(b) : top(b),
    );
    const lastK = p.route.length - 1;
    const landTier = tiers[lastK];
    const landing = segs.length ? segs[segs.length - 1].to : p.at;
    if (frame >= landing && landTier.queue) {
      const key = `${lastK}:${p.route[lastK]}`;
      landed.set(key, [...(landed.get(key) ?? []), landing]);
      continue;
    }
    // до выхода ждёт на нижней кромке первого узла; внутри узла невидимо —
    // узел на это время залит, сообщение «в нём»
    let pos: {x: number; y: number} | null = exits[0];
    for (let k = 0; k < segs.length; k++) {
      const seg = segs[k];
      if (frame < seg.from) break;
      if (frame <= seg.to) {
        const u = interpolate(frame, [seg.from, seg.to], [0, 1], {
          ...clamp,
          easing: ease.travel,
        });
        pos = {
          x: exits[k].x + (entries[k + 1].x - exits[k].x) * u,
          y: exits[k].y + (entries[k + 1].y - exits[k].y) * u,
        };
        break;
      }
      pos = null;
      // стоит в узле k+1 — узел залит, пока сообщение внутри, не дольше
      const next = segs[k + 1];
      if (!next || frame < next.from) {
        const key = `${k + 1}:${p.route[k + 1]}`;
        if (!held.has(key)) held.set(key, seg.to);
      }
    }
    if (pos) packetViews.push({...pos, scale: pop(frame, p.at)});
  }

  return (
    <div style={{position: 'relative', width, height}}>
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        {edges.map((e, k) =>
          visibleAt(e.onset) ? (
            <Edge
              key={k}
              from={e.from}
              to={e.to}
              progress={interpolate(
                frame,
                [e.onset as number, (e.onset as number) + dur.block],
                [0, 1],
                {...clamp, easing: ease.out},
              )}
              active={e.activeAt !== null && frame >= e.activeAt}
            />
          ) : null,
        )}
      </svg>

      {L.map((tl, i) => {
        const tier = tiers[i];
        const fo = tierOnset(i);
        return (
          <React.Fragment key={i}>
            {tl.frame ? (
              <div
                style={{
                  position: 'absolute',
                  left: tl.frame.x,
                  top: tl.frame.y,
                  width: tl.frame.w,
                  height: tl.frame.h,
                  boxSizing: 'border-box',
                  padding: FRAME_PAD,
                  borderRadius: shape.slot.radius,
                  border: `${shape.slot.border}px solid ${color.ink}`,
                  opacity: visibleAt(fo) ? 1 : 0,
                  transform: `scale(${popScale(fo)})`,
                  ...t.dataLabel,
                  lineHeight: `${t.dataLabel.fontSize}px`,
                  color: color.ink,
                }}
              >
                {tier.frame}
              </div>
            ) : null}

            {tl.nodes.map((box, j) => {
              const onset = nodeOnset(i, j);
              const key = `${i}:${j}`;
              const reading = i === last ? readingOnset(steps, j) : null;
              const heldAt = held.get(key);
              const lit =
                (reading !== null && frame >= reading) || heldAt !== undefined;
              const litAt = heldAt ?? (reading as number);
              const litScale = lit ? 0.9 + pop(frame, litAt) * 0.1 : 1;

              if (!tier.queue) {
                return (
                  <div
                    key={j}
                    style={{position: 'absolute', left: box.x, top: box.y}}
                  >
                    <Node
                      label={tier.nodes[j]}
                      width={box.w}
                      height={box.h}
                      fill={lit ? fill : null}
                      scale={popScale(onset) * litScale}
                      opacity={visibleAt(onset) ? 1 : 0}
                    />
                  </div>
                );
              }

              const preset = tier.cells?.[j] ?? 0;
              const arrivals = (landed.get(key) ?? []).sort((a, b) => a - b);
              const cellGap = dur.micro;
              const cellW =
                (box.w - PAD * 2 - shape.meter.border * 2 - cellGap * (CAP - 1)) /
                CAP;
              return (
                <div
                  key={j}
                  style={{
                    position: 'absolute',
                    left: box.x,
                    top: box.y,
                    width: box.w,
                    height: box.h,
                    boxSizing: 'border-box',
                    padding: PAD,
                    borderRadius: shape.meter.radius,
                    border: `${shape.meter.border}px solid ${color.ink}`,
                    opacity: visibleAt(onset) ? 1 : 0,
                    transform: `scale(${popScale(onset)})`,
                  }}
                >
                  <div
                    style={{
                      ...t.dataLabel,
                      letterSpacing: '0.08em',
                      color: color.ink,
                      height: t.dataLabel.fontSize,
                      lineHeight: `${t.dataLabel.fontSize}px`,
                    }}
                  >
                    {tier.nodes[j]}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: cellGap,
                      marginTop: dur.micro,
                      height: CELL_H,
                    }}
                  >
                    {Array.from(
                      {length: Math.min(CAP, preset + arrivals.length)},
                      (_, c) => {
                        const at = c < preset ? null : arrivals[c - preset];
                        return (
                          <div
                            key={c}
                            style={{
                              width: cellW,
                              height: '100%',
                              backgroundColor: fill,
                              borderRadius: shape.slot.radius / 4,
                              transform: `scale(${at === null ? 1 : 0.9 + pop(frame, at) * 0.1})`,
                            }}
                          />
                        );
                      },
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {packetViews.map((v, k) => (
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
