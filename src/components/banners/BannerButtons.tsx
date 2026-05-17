import React, { useState } from 'react';
import type { BannerButton } from '../../types/banner';
import { trackBannerEvent } from '../../services/bannerService';

interface BannerButtonsProps {
  buttons:  BannerButton[];
  bannerId: string;
  /** Spacing between buttons — defaults to flex wrap gap-3 */
  className?: string;
}

export const BannerButtons: React.FC<BannerButtonsProps> = ({ buttons, bannerId, className }) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ''}`}>
      {buttons.map(btn => (
        <BannerButtonItem key={btn.id} btn={btn} bannerId={bannerId} />
      ))}
    </div>
  );
};

/** Individual button with hover state support */
const BannerButtonItem: React.FC<{ btn: BannerButton; bannerId: string }> = ({ btn, bannerId }) => {
  const [hovered, setHovered] = useState(false);

  const bg    = hovered && btn.hover_background ? btn.hover_background : (btn.background_color ?? '#FBBF24');
  const color = hovered && btn.hover_color       ? btn.hover_color       : (btn.text_color       ?? '#000000');

  const style: React.CSSProperties = {
    backgroundColor: bg,
    color,
    border:       btn.border_color ? `2px solid ${btn.border_color}` : undefined,
    borderRadius: btn.border_radius ?? '14px',
    padding:      btn.padding       ?? '14px 28px',
    boxShadow:    btn.shadow_style  ?? undefined,
    fontSize:     '0.875rem',
    fontWeight:   700,
    display:      'inline-flex',
    alignItems:   'center',
    gap:          '8px',
    textDecoration: 'none',
    transition:   'all 0.2s ease',
    transform:    hovered ? 'scale(1.04)' : 'scale(1)',
  };

  const handleClick = () => {
    trackBannerEvent(bannerId, 'click', btn.id).catch(() => {/* silent */});
  };

  return (
    <a
      href={btn.link}
      target={btn.open_new_tab ? '_blank' : '_self'}
      rel={btn.open_new_tab ? 'noopener noreferrer' : undefined}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      className="active:scale-95"
    >
      {btn.icon && <span aria-hidden="true">{btn.icon}</span>}
      {btn.text}
    </a>
  );
};
