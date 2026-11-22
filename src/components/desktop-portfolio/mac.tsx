import type { CSSProperties, ReactNode } from 'react';

export const SYS_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";
export const MONO_FONT = "'SF Mono', Menlo, Monaco, Consolas, monospace";

export const ACCENT = '#007AFF';
export const GREEN = '#34C759';
export const RED = '#FF3B30';
export const LABEL = 'rgba(0,0,0,0.85)';
export const LABEL_2 = 'rgba(0,0,0,0.5)';
export const LABEL_3 = 'rgba(0,0,0,0.25)';
export const SEPARATOR = 'rgba(0,0,0,0.1)';

export const bodyText: CSSProperties = {
  fontFamily: SYS_FONT,
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.35,
  color: LABEL,
};

export function MacStyles() {
  return (
    <style>{`
      .mac-scroll { overflow: auto; }
      .mac-scroll::-webkit-scrollbar { width: 11px; height: 11px; background: transparent; }
      .mac-scroll::-webkit-scrollbar-track { background: transparent; }
      .mac-scroll::-webkit-scrollbar-corner { background: transparent; }
      .mac-scroll::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 6px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      .mac-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.35); }
      .mac-scroll.mac-dark:hover::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.35); }
    `}</style>
  );
}

type IconProps = { size?: number; color?: string; style?: CSSProperties };

function Svg({ size = 16, color = 'currentColor', style, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const Icon = {
  ChevronLeft: (p: IconProps) => <Svg {...p}><path d="M12.5 4.5 7 10l5.5 5.5" /></Svg>,
  ChevronRight: (p: IconProps) => <Svg {...p}><path d="M7.5 4.5 13 10l-5.5 5.5" /></Svg>,
  ChevronDown: (p: IconProps) => <Svg {...p}><path d="M4.5 7.5 10 13l5.5-5.5" /></Svg>,
  Folder: (p: IconProps) => <Svg {...p}><path d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h3.6l1.8 2h6.6a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5z" /><path d="M2.5 8h15" /></Svg>,
  Doc: (p: IconProps) => <Svg {...p}><path d="M5 2.5h6.5l3.5 3.5v11.5H5z" /><path d="M11.5 2.5V6H15" /><path d="M7.5 10h5M7.5 13h5" /></Svg>,
  Search: (p: IconProps) => <Svg {...p}><circle cx="8.5" cy="8.5" r="5.5" /><path d="m12.5 12.5 4.5 4.5" /></Svg>,
  Plus: (p: IconProps) => <Svg {...p}><path d="M10 4v12M4 10h12" /></Svg>,
  Minus: (p: IconProps) => <Svg {...p}><path d="M4 10h12" /></Svg>,
  Sidebar: (p: IconProps) => <Svg {...p}><rect x="2.5" y="3.5" width="15" height="13" rx="2.5" /><path d="M7.5 3.5v13" /></Svg>,
  List: (p: IconProps) => <Svg {...p}><path d="M3 5h14M3 10h14M3 15h14" /></Svg>,
  Trash: (p: IconProps) => <Svg {...p}><path d="M3.5 5.5h13" /><path d="M8 5.5V3.5h4v2" /><path d="M5 5.5l.8 11h8.4l.8-11" /></Svg>,
  Compose: (p: IconProps) => <Svg {...p}><path d="M16 10.5V16a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16V6a1.5 1.5 0 0 1 1.5-1.5H10" /><path d="M14.5 2.5l3 3-7 7H7.5v-3z" /></Svg>,
  Format: (p: IconProps) => <Svg {...p}><path d="M2.5 15.5 6.5 4.5h1l4 11" /><path d="M4 11.5h6" /><path d="M17.5 15.5v-5a2 2 0 0 0-3.5-1.3" /><path d="M17.5 13c-1.5-1-4.5-.5-4.5 1.2 0 1.6 2.6 1.7 4.5.3" /></Svg>,
  Checklist: (p: IconProps) => <Svg {...p}><circle cx="5" cy="6" r="2" /><circle cx="5" cy="14" r="2" /><path d="M9.5 6h8M9.5 14h8" /></Svg>,
  Table: (p: IconProps) => <Svg {...p}><rect x="2.5" y="3.5" width="15" height="13" rx="2" /><path d="M2.5 8h15M2.5 12.5h15M8 3.5v13M12.5 3.5v13" /></Svg>,
  Photo: (p: IconProps) => <Svg {...p}><rect x="2.5" y="4" width="15" height="12" rx="2" /><circle cx="7" cy="8" r="1.3" /><path d="m3 14 4-3.5 3 2.5 3-2.5 4.5 3.5" /></Svg>,
  Lock: (p: IconProps) => <Svg {...p}><rect x="4.5" y="9" width="11" height="8.5" rx="2" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" /></Svg>,
  Share: (p: IconProps) => <Svg {...p}><path d="M6.5 8H5.5A1.5 1.5 0 0 0 4 9.5v6A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 14.5 8h-1" /><path d="M10 12V2.5M7 5.5l3-3 3 3" /></Svg>,
  Heart: (p: IconProps) => <Svg {...p}><path d="M10 16.5s-6.5-3.8-6.5-8.3A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 6.5 2.2c0 4.5-6.5 8.3-6.5 8.3z" /></Svg>,
  Info: (p: IconProps) => <Svg {...p}><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5" /><path d="M10 6.2v.1" /></Svg>,
  PaperPlane: (p: IconProps) => <Svg {...p}><path d="M17.5 2.5 9 11" /><path d="M17.5 2.5 12 17.5 9 11 2.5 8z" /></Svg>,
  Briefcase: (p: IconProps) => <Svg {...p}><rect x="2.5" y="6" width="15" height="10.5" rx="2" /><path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6" /><path d="M2.5 10.5h15" /></Svg>,
  GradCap: (p: IconProps) => <Svg {...p}><path d="M10 4 1.5 8 10 12l8.5-4z" /><path d="M5 9.7v3.8c1.5 1.4 3.2 2 5 2s3.5-.6 5-2V9.7" /><path d="M18.5 8v4.5" /></Svg>,
  Seal: (p: IconProps) => <Svg {...p}><circle cx="10" cy="8" r="5" /><path d="m7 12.2-1.5 5.3L10 16l4.5 1.5-1.5-5.3" /></Svg>,
  Link: (p: IconProps) => <Svg {...p}><path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1" /><path d="M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" /></Svg>,
  Calendar: (p: IconProps) => <Svg {...p}><rect x="2.5" y="3.5" width="15" height="14" rx="2" /><path d="M2.5 7.5h15M6.5 2v3M13.5 2v3" /></Svg>,
  Explorer: (p: IconProps) => <Svg {...p}><path d="M5 2.5h6.5L15 6v11.5H5z" /><path d="M11.5 2.5V6H15" /></Svg>,
};
