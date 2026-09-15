import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {color, dur, ease, font, type as t} from '../theme';

/**
 * Заголовочный блок. Каскад по §6: надзаголовок → бейдж → линия →
 * заголовок → лид, шаг `dur.stagger`.
 */
export const TitleBlock: React.FC<{
  kicker: string;
  badge: string;
  title: string;
  titleSize?: number;
  lead: string;
}> = ({kicker, badge, title, titleSize, lead}) => {
  const frame = useCurrentFrame();

  const step = (i: number) => {
    const delay = i * dur.stagger;
    const progress = interpolate(frame, [delay, delay + dur.block], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease.out,
    });
    return {
      opacity: progress,
      transform: `translateY(${(1 - progress) * dur.block}px)`,
    };
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{...t.kicker, ...step(0)}}>{kicker}</span>
        <span
          style={{
            ...step(1),
            backgroundColor: color.ink,
            color: color.paper,
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: t.kicker.fontSize,
            letterSpacing: t.dataLabel.letterSpacing,
            textTransform: 'uppercase',
            padding: `${dur.block}px ${dur.beat}px`,
            borderRadius: dur.stagger * 4,
          }}
        >
          {badge}
        </span>
      </div>

      <div
        style={{
          ...step(2),
          width: t.title.fontSize * 1.5,
          height: dur.elem,
          backgroundColor: color.accent,
          marginTop: dur.beat * 2,
        }}
      />

      <div
        style={{
          ...t.title,
          ...step(3),
          fontSize: titleSize ?? t.title.fontSize,
          color: color.ink,
          marginTop: dur.beat,
        }}
      >
        {title}
      </div>

      <div style={{...t.lead, ...step(4), color: color.ink, marginTop: dur.beat}}>
        {lead}
      </div>
    </div>
  );
};
