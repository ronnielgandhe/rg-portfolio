import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SYS_FONT, LABEL, LABEL_2, RED, Icon, MacStyles } from './mac';

const BOOKING_URL = 'https://calendly.com/ronnielgandhe?embed_type=Inline&embed_domain=ronnielgandhe.com&hide_gdpr_banner=1&hide_landing_page_details=1&background_color=ffffff&primary_color=007aff';
const HOUR_PX = 60;
const WEEKEND_BG = '#f7f7f7';
const isWeekend = (d: number) => d === 0 || d === 6;

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

interface CalendarProps {
  windowMode?: boolean;
}

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const Calendar = (_props: CalendarProps) => {
  const realToday = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(realToday.getFullYear(), realToday.getMonth(), realToday.getDate()));
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [showBooking, setShowBooking] = useState(false);

  const today = {
    year: realToday.getFullYear(),
    month: realToday.getMonth(),
    day: realToday.getDate(),
    dayOfWeek: realToday.getDay(),
  };

  const isToday = (y: number, m: number, d: number) =>
    d === today.day && m === today.month && y === today.year;

  // Navigation
  const goToPrev = useCallback(() => {
    setCurrentDate(prev => {
      if (viewMode === 'Day') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1);
      if (viewMode === 'Week') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7);
      if (viewMode === 'Month') return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return new Date(prev.getFullYear() - 1, 0, 1);
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      if (viewMode === 'Day') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      if (viewMode === 'Week') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7);
      if (viewMode === 'Month') return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return new Date(prev.getFullYear() + 1, 0, 1);
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(today.year, today.month, today.day));
  }, [today.year, today.month, today.day]);

  // Header text
  const headerText = useMemo(() => {
    if (viewMode === 'Year') return `${currentDate.getFullYear()}`;
    if (viewMode === 'Month') return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'Week') {
      const start = getWeekStart(currentDate);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
      }
      if (start.getFullYear() === end.getFullYear()) {
        return `${MONTHS[start.getMonth()]} – ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
      }
      return `${MONTHS[start.getMonth()]} ${start.getFullYear()} – ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    // Day
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [viewMode, currentDate]);

  const openBooking = () => setShowBooking(true);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
      background: '#fff', fontFamily: SYS_FONT, fontSize: '13px', lineHeight: 1.35, color: LABEL,
      userSelect: 'none',
    }}>
      <MacStyles />
      <div style={{
        height: '52px', minHeight: '52px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '0 80px', boxSizing: 'border-box', borderBottom: '0.5px solid rgba(0,0,0,0.1)', background: '#f6f6f6',
      }}>
        <div style={{ display: 'flex' }}>
          <ToolBtn onClick={openBooking} tooltip="Book a Meeting"><Icon.Plus size={18} /></ToolBtn>
        </div>
        <div style={{
          display: 'inline-flex', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '6px', padding: '2px', height: '24px', boxSizing: 'border-box',
        }}>
          {(['Day', 'Week', 'Month', 'Year'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0 14px', borderRadius: '5px', border: 'none', fontSize: '12px', fontWeight: 400,
                fontFamily: SYS_FONT, cursor: 'default',
                background: mode === viewMode ? '#ffffff' : 'transparent',
                color: LABEL,
                boxShadow: mode === viewMode ? '0 0.5px 1.5px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
        <div />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: LABEL, margin: 0, fontFamily: SYS_FONT, letterSpacing: '-0.3px' }}>
            {headerText.split(' ')[0]}
            {headerText.includes(' ') && (
              <span style={{ fontWeight: 400 }}>{' '}{headerText.split(' ').slice(1).join(' ')}</span>
            )}
          </h1>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <NavButton onClick={goToPrev} label="Previous"><Icon.ChevronLeft size={14} /></NavButton>
            <button onClick={goToToday} style={{
              height: '22px', padding: '0 10px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.15)',
              background: '#fff', fontSize: '13px', color: LABEL, cursor: 'default', fontFamily: SYS_FONT,
              boxShadow: '0 0.5px 1px rgba(0,0,0,0.08)',
            }}>
              Today
            </button>
            <NavButton onClick={goToNext} label="Next"><Icon.ChevronRight size={14} /></NavButton>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {viewMode === 'Month' && <MonthView currentDate={currentDate} today={today} isToday={isToday} setCurrentDate={setCurrentDate} setViewMode={setViewMode} onBook={openBooking} />}
          {viewMode === 'Year' && <YearView currentDate={currentDate} today={today} isToday={isToday} setCurrentDate={setCurrentDate} setViewMode={setViewMode} />}
          {viewMode === 'Week' && <WeekView currentDate={currentDate} today={today} isToday={isToday} onBook={openBooking} />}
          {viewMode === 'Day' && <DayView currentDate={currentDate} today={today} isToday={isToday} onBook={openBooking} />}
        </div>
      </div>

      {showBooking && (
        <div style={{ position: 'absolute', inset: '52px 0 0 0', background: 'rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
          <div style={{
            width: '520px', maxWidth: 'calc(100% - 24px)', height: 'calc(100% - 16px)', background: '#fff',
            borderRadius: '0 0 10px 10px', boxShadow: '0 10px 30px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'calSheetIn 0.22s ease-out',
          }}>
            <iframe
              src={BOOKING_URL}
              style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
              title="Book a Meeting"
            />
            <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px', borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
              <button onClick={() => setShowBooking(false)} style={{
                height: '22px', padding: '0 14px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.15)',
                background: '#fff', fontSize: '13px', color: LABEL, fontFamily: SYS_FONT, cursor: 'default',
                boxShadow: '0 0.5px 1px rgba(0,0,0,0.08)',
              }}>Done</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes calSheetIn { from { transform: translateY(-24px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// MONTH VIEW
// ────────────────────────────────────────────────────────────
function MonthView({ currentDate, isToday, setCurrentDate, onBook }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean;
  setCurrentDate: (d: Date) => void; setViewMode: (v: ViewMode) => void; onBook: () => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '0.5px solid rgba(0,0,0,0.12)' }}>
        {DAYS_FULL.map((day) => (
          <div key={day} style={{ textAlign: 'right', fontSize: '12px', color: LABEL_2, padding: '4px 8px' }}>{day}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {grid.map((row, ri) => (
          <div key={ri} style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1,
            borderBottom: ri < grid.length - 1 ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
          }}>
            {row.map((cell, ci) => {
              const todayCell = isToday(cell.year, cell.month, cell.day);
              const dim = !cell.isCurrentMonth;
              return (
                <div
                  key={ci}
                  onClick={() => { if (dim) setCurrentDate(new Date(cell.year, cell.month, 1)); }}
                  onDoubleClick={onBook}
                  style={{
                    padding: '4px 6px', cursor: 'default', minHeight: '50px',
                    borderRight: ci < 6 ? '0.5px solid rgba(0,0,0,0.08)' : 'none',
                    background: isWeekend(ci) ? WEEKEND_BG : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', height: '24px' }}>
                    {cell.day === 1 && (
                      <span style={{ fontSize: '13px', color: dim ? LABEL_2 : LABEL }}>{MONTHS[cell.month].slice(0, 3)}</span>
                    )}
                    {todayCell ? (
                      <span style={{
                        minWidth: '24px', height: '24px', borderRadius: '12px', background: RED, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600,
                      }}>{cell.day}</span>
                    ) : (
                      <span style={{ fontSize: '13px', color: dim ? 'rgba(0,0,0,0.3)' : LABEL, padding: '0 4px' }}>{cell.day}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// YEAR VIEW
// ────────────────────────────────────────────────────────────
function YearView({ currentDate, today, isToday, setCurrentDate, setViewMode }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean;
  setCurrentDate: (d: Date) => void; setViewMode: (v: ViewMode) => void;
}) {
  const year = currentDate.getFullYear();

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '8px 24px 24px',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px 32px',
    }}>
      {Array.from({ length: 12 }, (_, m) => (
        <MiniMonth
          key={m}
          year={year}
          month={m}
          today={today}
          isToday={isToday}
          onClick={() => {
            setCurrentDate(new Date(year, m, 1));
            setViewMode('Month');
          }}
        />
      ))}
    </div>
  );
}

function MiniMonth({ year, month, today, isToday, onClick }: {
  year: number; month: number;
  today: { year: number; month: number; day: number };
  isToday: (y: number, m: number, d: number) => boolean;
  onClick: () => void;
}) {
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* Month name */}
      <div style={{
        fontSize: '13px', fontWeight: 600, color: RED, marginBottom: '6px',
        fontFamily: SYS_FONT,
      }}>
        {MONTHS[month]}
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
        {DAYS_SHORT.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: '9px', fontWeight: 600, color: LABEL_2,
            padding: '1px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      {grid.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
          {row.map((cell, ci) => {
            const isTodayCell = isToday(cell.year, cell.month, cell.day);
            return (
              <div key={ci} style={{
                textAlign: 'center', padding: '1.5px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isTodayCell ? (
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: RED,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{cell.day}</span>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '10px', fontWeight: 400,
                    color: cell.isCurrentMonth ? LABEL : 'rgba(0,0,0,0.25)',
                    lineHeight: '18px',
                  }}>
                    {cell.day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TimeGrid({ days, isToday, onBook }: {
  days: Date[];
  isToday: (y: number, m: number, d: number) => boolean;
  onBook: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_PX - 12; }, []);
  const now = new Date();
  const nowTop = (now.getHours() * 60 + now.getMinutes()) * HOUR_PX / 60;
  const todayVisible = days.some(d => isToday(d.getFullYear(), d.getMonth(), d.getDate()));
  const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/, '');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(0,0,0,0.12)', minHeight: '30px' }}>
        <div style={{ width: '56px', minWidth: '56px' }} />
        {days.map((d, i) => {
          const t = isToday(d.getFullYear(), d.getMonth(), d.getDate());
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px',
              color: t ? RED : LABEL_2, borderLeft: '0.5px solid rgba(0,0,0,0.08)',
            }}>
              <span>{DAYS_FULL[d.getDay()]}</span>
              {t ? (
                <span style={{ minWidth: '20px', height: '20px', borderRadius: '10px', background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{d.getDate()}</span>
              ) : <span style={{ color: LABEL }}>{d.getDate()}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(0,0,0,0.12)', minHeight: '22px' }}>
        <div style={{ width: '56px', minWidth: '56px', fontSize: '11px', color: LABEL_2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px', boxSizing: 'border-box' }}>all-day</div>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, borderLeft: '0.5px solid rgba(0,0,0,0.08)', background: isWeekend(d.getDay()) ? WEEKEND_BG : 'transparent' }} />
        ))}
      </div>
      <div ref={scrollRef} className="mac-scroll" style={{ flex: 1 }}>
        <div style={{ display: 'flex', position: 'relative', height: 24 * HOUR_PX }}>
          <div style={{ width: '56px', minWidth: '56px', position: 'relative' }}>
            {HOURS.map((h) => h > 0 && (
              <span key={h} style={{ position: 'absolute', top: h * HOUR_PX - 6, right: '8px', fontSize: '11px', color: LABEL_2, lineHeight: 1 }}>
                {formatHour(h)}
              </span>
            ))}
            {todayVisible && (
              <span style={{
                position: 'absolute', top: nowTop - 8, right: '4px', height: '16px', padding: '0 5px', borderRadius: '8px',
                background: RED, color: '#fff', fontSize: '11px', fontWeight: 600, lineHeight: '16px', zIndex: 3,
                fontVariantNumeric: 'tabular-nums',
              }}>{timeLabel}</span>
            )}
          </div>
          {days.map((d, i) => {
            const t = isToday(d.getFullYear(), d.getMonth(), d.getDate());
            return (
              <div key={i} onDoubleClick={onBook} style={{
                flex: 1, position: 'relative', borderLeft: '0.5px solid rgba(0,0,0,0.08)',
                background: isWeekend(d.getDay()) ? WEEKEND_BG : 'transparent',
              }}>
                {HOURS.map((h) => (
                  <div key={h} style={{ position: 'absolute', top: h * HOUR_PX, left: 0, right: 0, height: '0.5px', background: 'rgba(0,0,0,0.08)' }} />
                ))}
                {t && <div style={{ position: 'absolute', top: nowTop, left: 0, right: 0, height: '1px', background: RED, zIndex: 2 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({ currentDate, isToday, onBook }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean; onBook: () => void;
}) {
  const start = getWeekStart(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  return <TimeGrid days={days} isToday={isToday} onBook={onBook} />;
}

function DayView({ currentDate, isToday, onBook }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean; onBook: () => void;
}) {
  return <TimeGrid days={[currentDate]} isToday={isToday} onBook={onBook} />;
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h === 12) return 'Noon';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

interface GridCell {
  day: number; month: number; year: number; isCurrentMonth: boolean;
}

function buildMonthGrid(year: number, month: number): GridCell[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const rows: GridCell[][] = [];
  let currentRow: GridCell[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const m = month - 1 < 0 ? 11 : month - 1;
    const y = month - 1 < 0 ? year - 1 : year;
    currentRow.push({ day: daysInPrevMonth - i, month: m, year: y, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    currentRow.push({ day: d, month, year, isCurrentMonth: true });
    if (currentRow.length === 7) { rows.push(currentRow); currentRow = []; }
  }

  // Next month
  if (currentRow.length > 0) {
    let nextDay = 1;
    const nm = month + 1 > 11 ? 0 : month + 1;
    const ny = month + 1 > 11 ? year + 1 : year;
    while (currentRow.length < 7) {
      currentRow.push({ day: nextDay++, month: nm, year: ny, isCurrentMonth: false });
    }
    rows.push(currentRow);
  }

  // Pad to 6 rows
  while (rows.length < 6) {
    const lastRow = rows[rows.length - 1];
    const last = lastRow[lastRow.length - 1];
    let nd = last.day + 1;
    let nm = last.month;
    let ny = last.year;
    const dim = new Date(ny, nm + 1, 0).getDate();
    if (nd > dim) { nd = 1; nm++; if (nm > 11) { nm = 0; ny++; } }
    const newRow: GridCell[] = [];
    for (let i = 0; i < 7; i++) {
      newRow.push({ day: nd, month: nm, year: ny, isCurrentMonth: false });
      nd++;
      const d2 = new Date(ny, nm + 1, 0).getDate();
      if (nd > d2) { nd = 1; nm++; if (nm > 11) { nm = 0; ny++; } }
    }
    rows.push(newRow);
  }

  return rows;
}

// ── UI Components ──
function ToolBtn({ children, onClick, tooltip }: { children: ReactNode; onClick: () => void; tooltip: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div title={tooltip} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px',
      color: 'rgba(0,0,0,0.6)', background: hover ? 'rgba(0,0,0,0.06)' : 'transparent', cursor: 'default',
    }}>
      {children}
    </div>
  );
}

function NavButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} style={{
      width: '24px', height: '22px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,0.15)',
      background: '#fff', color: LABEL, cursor: 'default', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0.5px 1px rgba(0,0,0,0.08)',
    }}>
      {children}
    </button>
  );
}

export default Calendar;
