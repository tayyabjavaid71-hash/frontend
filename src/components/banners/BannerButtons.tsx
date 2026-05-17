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
  const defaultBg     = isPrimary ? '#FBBF24'                  : 'rgba(255,255,255,0.12)';
  const defaultColor  = isPrimary ? '#1a0a2e'                  : '#ffffff';
  const defaultHoverBg = isPrimary ? '#F59E0B'                 : 'rgba(255,255,255,0.22)';
  const defaultShadow  = isPrimary
    ? '0 8px 32px rgba(251,191,36,0.45), 0 2px 8px rgba(0,0,0,0.3)'
    : '0 4px 16px rgba(0,0,0,0.2)';

  const bg     = hovered
    ? (btn.hover_background || defaultHoverBg)
    : (btn.background_color || defaultBg);
  const color  = hovered
    ? (btn.hover_color || defaultColor)
    : (btn.text_color  || defaultColor);

  const border = isPrimary && !btn.border_color
    ? undefined
    : `1.5px solid ${btn.border_color || 'rgba(255,255,255,0.35)'}`;

  const style: React.CSSProperties = {
    backgroundColor: bg,
    color,
    border,
    borderRadius:   btn.border_radius ?? (isPrimary ? '12px' : '12px'),
    padding:        btn.padding       ?? (isPrimary ? '14px 32px' : '13px 28px'),
    boxShadow:      hovered
      ? (btn.shadow_style ?? defaultShadow)
      : (isPrimary ? '0 4px 20px rgba(251,191,36,0.3), 0 2px 6px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.15)'),
    backdropFilter:  !isPrimary ? 'blur(8px)' : undefined,
    WebkitBackdropFilter: !isPrimary ? 'blur(8px)' : undefined,
    fontSize:       '0.875rem',
    fontWeight:     700,
    letterSpacing:  '0.01em',
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
