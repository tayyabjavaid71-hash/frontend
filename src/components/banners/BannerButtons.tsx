import React from 'react';
import type { BannerButton } from '../../types/banner';
import { trackBannerEvent } from '../../services/bannerService';

interface BannerButtonsProps {
  buttons: BannerButton[];
  bannerId: string;
}

export const BannerButtons: React.FC<BannerButtonsProps> = ({ buttons, bannerId }) => {
  if (!buttons || buttons.length === 0) return null;

  const handleClick = (btn: BannerButton) => {
    trackBannerEvent(bannerId, 'click', btn.id).catch(() => {/* silent */});
  };

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {buttons.map((btn) => {
        const style: React.CSSProperties = {
          backgroundColor: btn.background_color ?? '#FBBF24',
          color:           btn.text_color       ?? '#000000',
          border:          btn.border_color ? `2px solid ${btn.border_color}` : undefined,
        };

        return (
          <a
            key={btn.id}
            href={btn.link}
            target={btn.open_new_tab ? '_blank' : '_self'}
            rel={btn.open_new_tab ? 'noopener noreferrer' : undefined}
            onClick={() => handleClick(btn)}
            style={style}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm
                       transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95
                       shadow-md no-underline"
          >
            {btn.text}
          </a>
        );
      })}
    </div>
  );
};
