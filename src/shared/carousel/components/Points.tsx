import React from 'react';
import {color, dur, shape, type as t} from '../../motion/theme';

/** Маркер пункта: квадрат акцента с офсетной тенью, как у слота, только мелкий. */
const MARK = dur.elem * 2;
/** Маркер стоит по центру первой строки лида. */
const MARK_TOP = (t.lead.fontSize * t.lead.lineHeight - MARK) / 2;

/** Пункты слайда. Кегль лида: ниже 26 px текста не бывает, а мельче лида не читается с телефона. */
export const Points: React.FC<{points: string[]; ink?: string}> = ({
  points,
  ink = color.ink,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: dur.beat}}>
    {points.map((p) => (
      <div key={p} style={{display: 'flex', gap: dur.beat}}>
        <div
          style={{
            flex: 'none',
            width: MARK,
            height: MARK,
            marginTop: MARK_TOP,
            backgroundColor: color.accent,
            boxShadow: `${shape.slot.border}px ${shape.slot.border}px 0 ${color.ink}`,
          }}
        />
        <div style={{...t.lead, color: ink}}>{p}</div>
      </div>
    ))}
  </div>
);
