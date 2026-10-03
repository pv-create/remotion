import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, pop, shape, type as t} from '../../motion/theme';
import {Arrow} from './Arrow';
import {Node} from './Node';
import type {DocItem, DocsSpec} from '../types';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const NODE_H = shape.slot.size * 0.72;
const PAD = dur.beat;
const GAP = dur.elem;
/** Чип над строками: имя файла или метод. */
const CHIP_H = t.dataLabel.fontSize + dur.elem;
const LINE_H = Math.round(t.code.fontSize * t.code.lineHeight);
const DOC_W = 0.36;
const NODE_W = 0.28;

type Box = {x: number; y: number; w: number; h: number};

const docHeight = (lines: number) => PAD * 2 + CHIP_H + GAP + lines * LINE_H;

/** Центр элемента — доля ширины схемы, ряд — сверху вниз; ряды одной высоты. */
const layout = (
  items: DocItem[],
  rows: number,
  width: number,
  height: number,
): Box[] => {
  const rowH = height / rows;
  return items.map((it) => {
    const w = (it.w ?? (it.kind === 'doc' ? DOC_W : NODE_W)) * width;
    const h = it.kind === 'doc' ? docHeight(it.lines?.length ?? 0) : NODE_H;
    return {x: it.x * width - w / 2, y: rowH * (it.row + 0.5) - h / 2, w, h};
  });
};

/** Концы стрелки: в одном ряду — от кромки к кромке, между рядами — снизу вверх. */
const anchors = (a: Box, b: Box, sameRow: boolean) => {
  if (sameRow) {
    return b.x >= a.x + a.w
      ? {from: {x: a.x + a.w, y: a.y + a.h / 2}, to: {x: b.x, y: b.y + b.h / 2}}
      : {from: {x: a.x, y: a.y + a.h / 2}, to: {x: b.x + b.w, y: b.y + b.h / 2}};
  }
  return b.y >= a.y + a.h
    ? {from: {x: a.x + a.w / 2, y: a.y + a.h}, to: {x: b.x + b.w / 2, y: b.y}}
    : {from: {x: a.x + a.w / 2, y: a.y}, to: {x: b.x + b.w / 2, y: b.y + b.h}};
};

/**
 * Документы и узлы. Документ — карточка с чипом (имя файла, метод) и
 * моноширинными строками, строки проявляются каскадом. Пунктирный документ
 * — «живёт отдельно, необязателен», залитый — бинарный блок. Узел — тот же
 * блок, что в потоке; `lit` — залит тоном перебивки, «только что появился».
 * Стрелки между элементами по id, растут на блок.
 *
 * Отклонение от §8 хендоффа то же, что у остальных схем: появление задано
 * кадрами в данных, а не вложенными `Sequence`.
 */
export const Docs: React.FC<
  DocsSpec & {tone: 'accent' | 'alarm'; width: number; height: number}
> = ({items, arrows = [], rows = 2, tone, width, height}) => {
  const frame = useCurrentFrame();
  const fill = tone === 'alarm' ? color.alarm : color.accent;
  const boxes = layout(items, rows, width, height);
  const index = new Map(items.map((it, i) => [it.id, i] as const));
  const visible = (at: number) => frame >= at;
  const popScale = (at: number) =>
    visible(at) ? 0.9 + pop(frame, at) * 0.1 : 0;

  return (
    <div style={{position: 'relative', width, height}}>
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        {arrows.map((a, k) => {
          const i = index.get(a.from);
          const j = index.get(a.to);
          if (i === undefined || j === undefined || !visible(a.at)) return null;
          const {from, to} = anchors(
            boxes[i],
            boxes[j],
            items[i].row === items[j].row,
          );
          return (
            <Arrow
              key={k}
              from={from}
              to={to}
              progress={interpolate(frame, [a.at, a.at + dur.block], [0, 1], {
                ...clamp,
                easing: ease.out,
              })}
              active
            />
          );
        })}
      </svg>

      {items.map((it, i) => {
        const box = boxes[i];
        if (it.kind === 'node') {
          return (
            <div key={it.id} style={{position: 'absolute', left: box.x, top: box.y}}>
              <Node
                label={it.label}
                width={box.w}
                height={box.h}
                fill={it.lit ? fill : null}
                scale={popScale(it.at)}
                opacity={visible(it.at) ? 1 : 0}
              />
            </div>
          );
        }
        const text = it.solid ? color.paper : it.dashed ? color.muted : color.ink;
        return (
          <div
            key={it.id}
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              boxSizing: 'border-box',
              padding: PAD,
              borderRadius: shape.slot.radius,
              border: `${shape.meter.border}px ${it.dashed ? 'dashed' : 'solid'} ${it.dashed ? color.muted : color.ink}`,
              backgroundColor: it.solid ? color.ink : color.paper,
              boxShadow: it.dashed ? 'none' : shape.slot.shadow,
              opacity: visible(it.at) ? 1 : 0,
              transform: `scale(${popScale(it.at)})`,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                height: CHIP_H,
                lineHeight: `${CHIP_H}px`,
                padding: `0 ${dur.elem}px`,
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                borderRadius: shape.meter.radius / 2,
                backgroundColor: it.solid ? color.paper : it.dashed ? 'transparent' : fill,
                border: it.dashed ? `${shape.meter.border / 2}px dashed ${color.muted}` : 'none',
                ...t.dataLabel,
                letterSpacing: '0.08em',
                color: it.dashed ? color.muted : color.ink,
              }}
            >
              {it.label}
            </div>
            <div style={{marginTop: GAP}}>
              {(it.lines ?? []).map((line, k) => (
                <div
                  key={k}
                  style={{
                    ...t.code,
                    height: LINE_H,
                    lineHeight: `${LINE_H}px`,
                    whiteSpace: 'pre',
                    color: text,
                    // строки проявляются каскадом вслед за карточкой
                    opacity: frame >= it.at + dur.elem + k * dur.stagger ? 1 : 0,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
