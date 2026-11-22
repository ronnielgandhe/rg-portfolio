import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Card from './Cards';
import { TOOL_LABELS, mmss, type CallActions, type CallView } from './events';

export const EASE = [0.2, 0.8, 0.2, 1] as const;

export default function CallStage({ view, startMs, actions }: { view: CallView; startMs: number; actions: CallActions }) {
  const { lines, panes, tools, focusedId, scrollId, phase } = view;
  const scrollRef = useRef<HTMLDivElement>(null);
  const last = lines[lines.length - 1];
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [lines.length, last?.text]);

  const tool = tools[0];
  const toolLabel = tool ? (TOOL_LABELS[tool.name] ?? 'working') : '';

  return (
    <div className="hv-call">
      <section className="hv-box hv-transcript" aria-label="transcript">
        <div className="hv-box-head">
          <span className="hv-label">transcript</span>
          <span className="hv-label hv-count">{lines.length > 0 ? `${lines.length} ${lines.length === 1 ? 'line' : 'lines'}` : ''}</span>
        </div>
        <div className="hv-lines" ref={scrollRef} aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {lines.length === 0 ? (
              <motion.p key="empty" className="hv-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                {phase === 'dialing' || phase === 'connecting' ? 'dialing. he picks up in a second.' : 'say something. he picks up on the first word.'}
              </motion.p>
            ) : (
              lines.map((ln, i) => (
                <motion.div
                  key={`${ln.who}-${ln.at}`}
                  className="hv-line"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: i === lines.length - 1 ? 1 : 0.58, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="hv-line-t">{mmss(Math.max(0, Math.floor((ln.at - startMs) / 1000)))}</span>
                  <span className="hv-line-who">{ln.who}</span>
                  <span className={`hv-line-text${ln.who === 'harvey' ? ' hv-line-harvey' : ''}`}>{ln.text}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="hv-onscreen" aria-label="on screen">
        <div className="hv-box hv-box-head hv-onscreen-head">
          <span className="hv-label">on screen</span>
          <span className="hv-tool">
            <AnimatePresence mode="wait" initial={false}>
              {toolLabel && (
                <motion.span key={toolLabel} className="hv-tool-in" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2, ease: EASE }}>
                  <span className="hv-tool-bar" aria-hidden />
                  {toolLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
        <div className="hv-cards">
          <AnimatePresence initial={false}>
            {panes.length === 0 && (
              <motion.div key="placeholder" className="hv-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, transition: { duration: 0.25, ease: EASE } }} transition={{ duration: 0.25, ease: EASE }}>
                <p>whatever harvey pulls up lands here. a section of law, a quote, the news, what congress is trading.</p>
              </motion.div>
            )}
            {panes.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.34, ease: EASE, opacity: { duration: 0.26, delay: 0.06 } }}
                style={{ overflow: 'hidden' }}
              >
                <div className="hv-card-gap">
                  <Card pane={p} focused={p.id === focusedId} scroll={p.id === scrollId} onDismiss={() => actions.dismiss(p.id)} onSeeAlso={actions.openSeeAlso} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
