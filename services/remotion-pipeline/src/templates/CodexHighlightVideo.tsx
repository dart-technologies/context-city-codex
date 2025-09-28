import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CodexHighlightProps} from '../types';

const fontFamily = '"Helvetica Neue", "Segoe UI", sans-serif';

const BACKGROUND_COLOR = '#050910';
const BRAND_FALLBACK = '#0B1221';
const ACCENT_FALLBACK = '#F5C333';
const GLASS_BG = 'rgba(10, 14, 25, 0.55)';
const GLASS_BORDER = 'rgba(245, 195, 51, 0.25)';

const fadeIn = (frame: number, duration = 15) => {
  return Math.min(1, Math.max(0, frame / duration));
};

const fadeOut = (frame: number, totalFrames: number, duration = 15) => {
  const start = totalFrames - duration;
  if (frame <= start) {
    return 1;
  }
  return Math.max(0, (totalFrames - frame) / duration);
};


const resolveAssetUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  if (url.startsWith('static://')) {
    return staticFile(url.replace('static://', ''));
  }
  if (url.startsWith('/')) {
    return staticFile(url.slice(1));
  }
  return url;
};

const Segment: React.FC<{
  segmentIndex: number;
  clipDuration: number;
  props: CodexHighlightProps;
  subtitleLocale: string;
}> = ({segmentIndex, clipDuration, props, subtitleLocale}) => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const segment = props.segments[segmentIndex];
  const opacity = fadeIn(frame) * fadeOut(frame, clipDuration * fps - 1);
  const subtitleText = segment.subtitles?.[subtitleLocale] ?? segment.caption;
  const accentColor = props.accentColor ?? ACCENT_FALLBACK;
  const brandColor = props.brandColor ?? BRAND_FALLBACK;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        padding: width * 0.06,
        color: 'white',
        fontFamily,
        textAlign: 'center',
        opacity,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `url(${resolveAssetUrl(segment.mediaUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(155deg, rgba(5, 9, 16, 0.82) 0%, rgba(5, 9, 16, 0.25) 45%, rgba(5, 9, 16, 0.8) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 18,
          paddingBottom: 80,
        }}
      >
        {segment.title ? (
          <div
            style={{
              fontSize: 70,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: accentColor,
              textShadow: '0 10px 18px rgba(0,0,0,0.6)',
            }}
          >
            {segment.title}
          </div>
        ) : null}
        <div
          style={{
            alignSelf: 'center',
            maxWidth: '90%',
            backgroundColor: GLASS_BG,
            border: `1px solid ${GLASS_BORDER}`,
            padding: '18px 32px',
            borderRadius: 24,
            fontSize: 54,
            lineHeight: 1.1,
            fontWeight: 600,
            textShadow: '0 6px 12px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {segment.caption}
        </div>
        {segment.rationale ? (
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.3,
              opacity: 0.9,
              textShadow: '0 4px 8px rgba(0,0,0,0.7)',
            }}
          >
            {segment.rationale}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          backgroundColor: GLASS_BG,
          border: `1px solid ${GLASS_BORDER}`,
          color: accentColor,
          padding: '14px 28px',
          borderRadius: 999,
          fontSize: 32,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 2,
          boxShadow: '0 14px 28px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(18px)',
        }}
      >
        {props.poi.name}
      </div>
      {subtitleText ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '80%',
            backgroundColor: GLASS_BG,
            border: `1px solid ${GLASS_BORDER}`,
            padding: '20px 36px',
            borderRadius: 28,
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.3,
            textShadow: '0 4px 10px rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 16px 34px rgba(0,0,0,0.55)',
            pointerEvents: 'none',
          }}
        >
          {subtitleText}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Header: React.FC<{props: CodexHighlightProps}> = ({props}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = fadeIn(frame, fps) * fadeOut(frame, fps * 2, fps);
  const accentColor = props.accentColor ?? ACCENT_FALLBACK;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily,
        padding: 80,
        textAlign: 'center',
        opacity,
        backgroundImage:
          'radial-gradient(circle at top, rgba(245, 195, 51, 0.25), transparent 45%), radial-gradient(circle at bottom, rgba(11, 18, 33, 0.85), transparent 60%)',
      }}
    >
      <div
        style={{
          fontSize: 90,
          fontWeight: 700,
          marginBottom: 30,
          textTransform: 'uppercase',
          letterSpacing: 6,
          color: accentColor,
          textShadow: '0 12px 22px rgba(0,0,0,0.55)',
        }}
      >
        {props.poi.name}
      </div>
      <div
        style={{
          fontSize: 48,
          lineHeight: 1.3,
          maxWidth: 900,
        }}
      >
        {props.summary}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{props: CodexHighlightProps}> = ({props}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = fadeIn(frame, fps) * fadeOut(frame, fps * 2, fps);
  const accentColor = props.accentColor ?? ACCENT_FALLBACK;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily,
        padding: 80,
        textAlign: 'center',
        opacity,
        backgroundImage:
          'linear-gradient(145deg, rgba(11, 18, 33, 0.85) 0%, rgba(5, 9, 16, 0.65) 45%, rgba(5, 9, 16, 0.9) 100%)',
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          marginBottom: 24,
          color: accentColor,
        }}
      >
        Codexierge tips in {props.codexiergeLocales.join(', ')}
      </div>
      <div
        style={{
          fontSize: 42,
          lineHeight: 1.4,
          maxWidth: 860,
        }}
      >
        Save this stop, share with your travel crew, or ask Codexierge for the next move.
      </div>
    </AbsoluteFill>
  );
};

export const CodexHighlightVideo: React.FC<CodexHighlightProps> = (props) => {
  const {fps} = useVideoConfig();

  const clipDuration = props.clipDurationSeconds ?? 5;
  const transitionFrames = Math.round((props.transitionMs ?? 500) / 1000 * fps);
  const segmentFrames = clipDuration * fps;
  const sequences = props.segments.map((segment, index) => ({segment, index}));
  const primaryLocale = props.poi.locale || props.codexiergeLocales?.[0] || 'en';
  const narration = props.narrations?.[primaryLocale];
  const ambient = props.soundtrackUrl;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND_COLOR,
        fontFamily,
        color: 'white',
        letterSpacing: 0.4,
      }}
    >
      <Sequence from={0} durationInFrames={fps * 3}>
        <Header props={props} />
      </Sequence>
      {sequences.map(({segment, index}) => {
        const from = fps * 3 + index * (segmentFrames - transitionFrames);
        return (
          <Sequence key={segment.assetId} from={from} durationInFrames={segmentFrames}>
            <Segment
              segmentIndex={index}
              clipDuration={clipDuration}
              props={props}
              subtitleLocale={primaryLocale}
            />
          </Sequence>
        );
      })}
      <Sequence from={fps * 3 + sequences.length * (segmentFrames - transitionFrames)} durationInFrames={fps * 3}>
        <Outro props={props} />
      </Sequence>
      {resolveAssetUrl(ambient) ? <Audio src={resolveAssetUrl(ambient)!} /> : null}
      {resolveAssetUrl(narration?.audioUrl) ? (
        <Audio src={resolveAssetUrl(narration?.audioUrl)!} />
      ) : null}
    </AbsoluteFill>
  );
};
