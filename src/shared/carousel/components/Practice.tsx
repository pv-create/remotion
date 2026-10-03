import React from 'react';
import {color, dur, shape, type as t} from '../../motion/theme';

/** Карточка «Практика»: рамка и офсетная тень слота, подпись данных, лид. */
export const Practice: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      padding: dur.beat * 1.5,
      borderRadius: shape.meter.radius,
      border: `${shape.slot.border}px solid ${color.ink}`,
      boxShadow: shape.slot.shadow,
      backgroundColor: color.paper,
    }}
  >
    <div style={t.dataLabel}>Практика</div>
    <div style={{...t.lead, color: color.ink, marginTop: dur.elem}}>{text}</div>
  </div>
);
