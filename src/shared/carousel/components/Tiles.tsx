import React from 'react';
import {color, dur, shape, type as t} from '../../motion/theme';
import type {Tile} from '../types';

/** Плитки в ряд: рамка блока схемы (как `Node` в перебивках), слово показанием, подпись данных. */
export const Tiles: React.FC<{tiles: Tile[]}> = ({tiles}) => (
  <div style={{display: 'flex', gap: dur.beat}}>
    {tiles.map((tile) => (
      <div
        key={tile.title}
        style={{
          flex: 1,
          boxSizing: 'border-box',
          padding: `${dur.beat}px ${dur.elem}px`,
          borderRadius: shape.meter.radius,
          border: `${shape.meter.border}px solid ${color.ink}`,
          textAlign: 'center',
        }}
      >
        <div style={{...t.readout, color: color.ink}}>{tile.title}</div>
        <div style={{...t.dataLabel, marginTop: dur.elem}}>{tile.text}</div>
      </div>
    ))}
  </div>
);
