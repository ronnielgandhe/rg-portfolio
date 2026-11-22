export const SYSTEM_FONT =
  'var(--os-font)';

export const MENU_BAR_HEIGHT = 28;
export const ACCENT = '#0a84ff';

export interface ChromeTokens {
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  separator: string;
  hover: string;
  dockBg: string;
  dockBorder: string;
  dockShadow: string;
  dockDot: string;
  dockDivider: string;
  tooltipBg: string;
  tooltipText: string;
  glass: string;
  tile: string;
}

export function chromeTokens(dark: boolean): ChromeTokens {
  return dark
    ? {
        panelBg: 'rgba(38, 38, 42, 0.72)',
        panelBorder: '0.5px solid rgba(255,255,255,0.16)',
        panelShadow: '0 0 0 0.5px rgba(0,0,0,0.55), 0 14px 40px rgba(0,0,0,0.45)',
        text: 'rgba(255,255,255,0.88)',
        textSecondary: 'rgba(255,255,255,0.55)',
        textTertiary: 'rgba(255,255,255,0.35)',
        textDisabled: 'rgba(255,255,255,0.26)',
        separator: 'rgba(255,255,255,0.12)',
        hover: 'rgba(255,255,255,0.08)',
        dockBg: 'rgba(40, 40, 44, 0.42)',
        dockBorder: '0.5px solid rgba(255,255,255,0.2)',
        dockShadow: '0 0 0 0.5px rgba(0,0,0,0.4), 0 10px 36px rgba(0,0,0,0.3)',
        dockDot: 'rgba(255,255,255,0.85)',
        dockDivider: 'rgba(255,255,255,0.22)',
        tooltipBg: 'rgba(44, 44, 48, 0.86)',
        tooltipText: 'rgba(255,255,255,0.9)',
        glass: 'rgba(28, 28, 32, 0.46)',
        tile: 'rgba(255,255,255,0.09)',
      }
    : {
        panelBg: 'rgba(246, 246, 246, 0.74)',
        panelBorder: '0.5px solid rgba(255,255,255,0.5)',
        panelShadow: '0 0 0 0.5px rgba(0,0,0,0.2), 0 14px 40px rgba(0,0,0,0.24)',
        text: 'rgba(0,0,0,0.85)',
        textSecondary: 'rgba(0,0,0,0.5)',
        textTertiary: 'rgba(0,0,0,0.35)',
        textDisabled: 'rgba(0,0,0,0.26)',
        separator: 'rgba(0,0,0,0.1)',
        hover: 'rgba(0,0,0,0.06)',
        dockBg: 'rgba(255, 255, 255, 0.36)',
        dockBorder: '0.5px solid rgba(255,255,255,0.45)',
        dockShadow: '0 0 0 0.5px rgba(0,0,0,0.16), 0 10px 36px rgba(0,0,0,0.18)',
        dockDot: 'rgba(0,0,0,0.6)',
        dockDivider: 'rgba(0,0,0,0.18)',
        tooltipBg: 'rgba(246, 246, 246, 0.9)',
        tooltipText: 'rgba(0,0,0,0.85)',
        glass: 'rgba(255, 255, 255, 0.32)',
        tile: 'rgba(255,255,255,0.55)',
      };
}

export const VIBRANCY = 'saturate(180%) blur(40px)';
