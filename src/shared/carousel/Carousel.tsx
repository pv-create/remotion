import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {color, dur, grid, safe, shape, type as t} from '../motion/theme';
import {TitleBlock} from '../motion/components/TitleBlock';
import {Sticker} from '../motion/components/Sticker';
import {Points} from './components/Points';
import {Tiles} from './components/Tiles';
import {Practice} from './components/Practice';
import {SETTLED_FRAME} from './config';
import type {Carousel as CarouselData, Slide} from './types';

/**
 * Карусель на токенах обучалок: цвет, кегли, формы — из `motion/theme`,
 * своих значений здесь нет. Интерфейса Instagram поверх слайда в ленте нет,
 * поэтому поле со всех сторон одно — боковое поле кадра.
 */
const PAD = safe.side;

const column: React.CSSProperties = {
  position: 'absolute',
  inset: PAD,
  display: 'flex',
  flexDirection: 'column',
};

const Title: React.FC<{text: string; size?: number; ink?: string}> = ({
  text,
  size,
  ink = color.ink,
}) => <div style={{...t.title, fontSize: size ?? t.title.fontSize, color: ink}}>{text}</div>;

/** Номер шага в залитом слоте: «включено», как активный слот в обучалке. */
const StepHead: React.FC<{n: number; label: string; tags?: string[]}> = ({
  n,
  label,
  tags,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: dur.beat * 1.5}}>
    <div
      style={{
        flex: 'none',
        width: shape.slot.size,
        height: shape.slot.size,
        boxSizing: 'border-box',
        borderRadius: shape.slot.radius,
        border: `${shape.slot.border}px solid ${color.ink}`,
        boxShadow: shape.slot.shadow,
        backgroundColor: color.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...t.readout,
        color: color.ink,
      }}
    >
      {String(n).padStart(2, '0')}
    </div>
    <div>
      <div style={t.kicker}>
        {label} #{n}
      </div>
      {tags?.length ? (
        <div style={{...t.dataLabel, color: color.ink, marginTop: dur.elem}}>
          {tags.join(' · ')}
        </div>
      ) : null}
    </div>
  </div>
);

const SlideBody: React.FC<{slide: Slide; step: number}> = ({slide, step}) => {
  switch (slide.kind) {
    case 'cover':
      return (
        <div style={column}>
          <TitleBlock
            kicker={slide.kicker}
            badge={slide.badge}
            title={slide.title}
            titleSize={slide.titleSize}
            lead={slide.lead}
          />
          {slide.sticker ? (
            <div style={{marginTop: dur.beat * 2, display: 'flex'}}>
              <Sticker text={slide.sticker} tone="accent" />
            </div>
          ) : null}
        </div>
      );

    case 'list':
      return (
        <div style={column}>
          <TitleBlock
            kicker={slide.kicker}
            badge={slide.badge}
            title={slide.title}
            titleSize={slide.titleSize}
            lead=""
          />
          <div style={{marginTop: dur.beat}}>
            <Points points={slide.points} />
          </div>
          {slide.tiles?.length ? (
            <div style={{marginTop: dur.beat * 2}}>
              <Tiles tiles={slide.tiles} />
            </div>
          ) : null}
        </div>
      );

    case 'step':
      return (
        <div style={column}>
          <StepHead n={step} label={slide.label} tags={slide.tags} />
          <div style={{marginTop: dur.beat * 2}}>
            <Title text={slide.title} size={slide.titleSize} />
          </div>
          <div style={{marginTop: dur.beat * 2}}>
            <Points points={slide.points} />
          </div>
          {slide.practice ? (
            <div style={{marginTop: dur.beat * 2}}>
              <Practice text={slide.practice} />
            </div>
          ) : null}
        </div>
      );

    case 'outro':
      return (
        <div style={{...column, justifyContent: 'flex-end'}}>
          <div style={t.kicker}>{slide.kicker}</div>
          <div style={{marginTop: dur.beat}}>
            <Title text={slide.title} size={slide.titleSize} ink={color.paper} />
          </div>
          <div style={{...t.lead, color: color.paper, marginTop: dur.beat}}>{slide.lead}</div>
          {slide.action ? (
            <div style={{...t.lead, color: color.accent, marginTop: dur.beat}}>
              {slide.action}
            </div>
          ) : null}
          {slide.sticker ? (
            <div style={{marginTop: dur.beat * 2, display: 'flex'}}>
              <Sticker text={slide.sticker} tone="accent" />
            </div>
          ) : null}
        </div>
      );
  }
};

/** Кадр композиции i — слайд i. Studio листает карусель по таймлайну. */
export const Carousel: React.FC<{carousel: CarouselData}> = ({carousel}) => {
  const frame = useCurrentFrame();
  const {slides} = carousel;
  const slide = slides[Math.min(frame, slides.length - 1)];
  const index = slides.indexOf(slide);
  const step = slides.slice(0, index + 1).filter((s) => s.kind === 'step').length;
  /** Финал — единственный инверсный кадр, как outro обучалки. */
  const inverse = slide.kind === 'outro';

  return (
    <AbsoluteFill style={{backgroundColor: inverse ? color.ink : color.paper}}>
      {inverse ? null : (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${color.ink} 1px, transparent 1px), linear-gradient(90deg, ${color.ink} 1px, transparent 1px)`,
            backgroundSize: `${grid.step}px ${grid.step}px`,
            opacity: grid.opacity,
          }}
        />
      )}

      {/* Сдвиг назад: внутри слайда уже кадр SETTLED_FRAME + i, всё встало.
          <Freeze> не годится — он упирается в длину композиции, а она = числу слайдов. */}
      <Sequence from={-SETTLED_FRAME} layout="none">
        <SlideBody slide={slide} step={step} />
      </Sequence>

      <div
        style={{
          ...t.dataLabel,
          position: 'absolute',
          left: PAD,
          bottom: (PAD - t.dataLabel.fontSize) / 2,
        }}
      >
        {index + 1} / {slides.length}
      </div>
    </AbsoluteFill>
  );
};
