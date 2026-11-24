import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { synthVoice } from './audio';
import { usePanes, type CallActions, type CallView, type Line, type Phase } from './events';
import { SCRIPT } from './preview';
import type { WaveFeed } from './Waveform';

interface Props {
  startMs: number;
  feed: MutableRefObject<WaveFeed>;
  actions: MutableRefObject<CallActions>;
  onView: (v: CallView) => void;
  onEnd: () => void;
}

interface Spoken extends Line { full: string; dur: number }

export default function PreviewCall({ startMs, feed, actions, onView, onEnd }: Props) {
  const [phase, setPhase] = useState<Phase>('connecting');
  const [spoken, setSpoken] = useState<Spoken[]>([]);
  const [muted, setMuted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [ending, setEnding] = useState(false);
  const { panes, tools, focusedId, scrollId, handle, openSeeAlso, dismiss } = usePanes(() => {});
  const voices = useRef<{ agent: ReturnType<typeof synthVoice>; mic: ReturnType<typeof synthVoice> } | null>(null);

  useEffect(() => {
    const agent = synthVoice(118);
    const mic = synthVoice(196);
    voices.current = { agent, mic };
    feed.current.agent = agent?.analyser ?? null;
    feed.current.mic = mic?.analyser ?? null;
    feed.current.fake = (who) => (who === 'agent' ? agent?.level() ?? 0 : mic?.level() ?? 0);
    return () => {
      agent?.stop();
      mic?.stop();
      feed.current.agent = null;
      feed.current.mic = null;
      feed.current.fake = null;
    };
  }, [feed]);

  useEffect(() => {
    const timers: number[] = [];
    for (const beat of SCRIPT) {
      timers.push(window.setTimeout(() => {
        setPhase(beat.phase);
        if (beat.event) handle(beat.event());
        if (beat.tool) handle({ type: 'tool_call', payload: { name: beat.tool, status: 'running' } });
        const v = voices.current;
        v?.agent?.talk(beat.phase === 'speaking');
        v?.mic?.talk(false);
        if (beat.who && beat.text) {
          const line: Spoken = { who: beat.who, text: '', full: beat.text, at: Date.now(), dur: beat.dur ?? 2000 };
          setSpoken((prev) => [...prev, line]);
          if (beat.who === 'you') {
            v?.mic?.talk(true);
            timers.push(window.setTimeout(() => v?.mic?.talk(false), line.dur));
          } else {
            timers.push(window.setTimeout(() => v?.agent?.talk(false), line.dur));
          }
        }
      }, beat.at));
    }
    const tick = window.setInterval(() => setNow(Date.now()), 90);
    return () => { timers.forEach(window.clearTimeout); window.clearInterval(tick); };
  }, [handle]);

  const finish = useCallback(() => {
    setEnding(true);
    voices.current?.agent?.talk(false);
    voices.current?.mic?.talk(false);
    window.setTimeout(onEnd, 420);
  }, [onEnd]);

  actions.current = {
    toggleMute: () => setMuted((m) => !m),
    end: finish,
    dismiss,
    openSeeAlso,
    tapToHear: () => {},
  };

  const lines: Line[] = spoken.map((s) => {
    const words = s.full.split(' ');
    const shown = s.who === 'you' ? words.length : Math.max(1, Math.ceil(Math.min(1, (now - s.at) / (s.dur * 0.92)) * words.length));
    return { who: s.who, text: words.slice(0, shown).join(' '), at: s.at };
  });
  const lineKey = lines.map((l) => l.text.length).join(',');

  useEffect(() => {
    onView({ phase: ending ? 'ending' : phase, lines, panes, tools, focusedId, scrollId, muted, needsTap: false });
  }, [onView, ending, phase, lineKey, panes, tools, focusedId, scrollId, muted, startMs]);

  return null;
}
