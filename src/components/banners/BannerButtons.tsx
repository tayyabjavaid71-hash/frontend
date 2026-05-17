import React, { useState } from 'react';
import type { BannerButton } from '../../types/banner';
import { trackBannerEvent } from '../../services/bannerService';

interface BannerButtonsProps {
  buttons:    BannerButton[];
  bannerId:   string;
  className?: string;
}

export const BannerButtons: React.FC<BannerButtonsProps> = ({ buttons, bannerId, className }) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ''}`}>
      {buttons.map((btn, idx) => (
        <BannerButtonItem key={btn.id} btn={btn} bannerId={bannerId} index={idx} />
      ))}
    </div>
  );
};

const BannerButtonItem: React.FC<{ btn: BannerButton; bannerId: string; index: number }> = ({
  btn, bannerId, index,
}) => {
  const [hovered, setHovered] = useState(false);

  // Primary (index 0) = solid filled; secondary (index 1+) = glass ghost
  const isPrimary = index === 0;

  // Resolved colors — use DB values or smart defaults based on slot
  // Primary: deep amber-gold with crisp black text (high contrast, premium)
  // Secondary: white with black text (clean, minimal, professional)
  const defaultBg      = isPrimary ? '#F59E0B'                    : 'rgba(255,255,255,0.95)';
  const defaultColor   = isPrimary ? '#0a0a0a'                    : '#111111';
  const defaultHoverBg = isPrimary ? '#D97706'                    : '#ffffff';
  const defaultShadow  = isPrimary
    ? '0 8px 32px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.25)'
    : '0 4px 20px rgba(0,0,0,0.18)';

  const bg    = hovered
    ? (btn.hover_background || defaultHoverBg)
    : (btn.background_color || defaultBg);
  const color = hovered
    ? (btn.hover_color || defaultColor)
    : (btn.text_color  || defaultColor);

  const border = isPrimary
    ? (btn.border_color ? `1.5px solid ${btn.border_color}` : 'none')
    : `1.5px solid ${btn.border_color || 'rgba(0,0,0,0.15)'}`;

  const style: React.CSSProperties = {
    backgroundColor: bg,
    color,
    border,
    borderRadius:   btn.border_radius ?? '12px',
    padding:        btn.padding       ?? (isPrimary ? '14px 32px' : '13px 28px'),
    boxShadow:      hovered
      ? (btn.shadow_style ?? defaultShadow)
      : (isPrimary
          ? '0 4px 16px rgba(245,158,11,0.35), 0 2px 6px rgba(0,0,0,0.15)'
          : '0 2px 10px rgba(0,0,0,0.12)'),
    backdropFilter:  !isPrimary ? 'blur(12px)' : undefined,
    WebkitBackdropFilter: !isPrimary ? 'blur(12px)' : undefined,
    fontSize:       '0.875rem',
    fontWeight:     700,
    letterSpacing:  '0.02em',
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '8px',
    textDecoration: 'none',
    transition:     'all 0.22s cubic-bezier(0.4,0,0.2,1)',
    transform:      hovered ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
  };

  return (
    <a
      href={btn.link}
      target={btn.open_new_tab ? '_blank' : '_self'}
      rel={btn.open_new_tab ? 'noopener noreferrer' : undefined}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => trackBannerEvent(bannerId, 'click', btn.id).catch(() => {})}
      className="active:scale-95 active:translate-y-0"
    >
      {btn.icon && <span aria-hidden="true" style={{ fontSize: '1em' }}>{btn.icon}</span>}
      {btn.text}
      {/* Primary button gets a subtle arrow */}
      {isPrimary && !btn.icon && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.8, transition: 'transform 0.2s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
          <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </a>
  );
};
