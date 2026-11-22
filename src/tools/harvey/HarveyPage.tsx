import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { Room } from 'livekit-client';
import PageShell from '../../components/portfolio/PageShell';
import HarveyHero from '../../components/portfolio/heroes/HarveyHero';
import CallStage from './CallStage';
import LiveCall from './LiveCall';
import PreviewCall from './PreviewCall';
import Waveform, { type WaveFeed, type WaveMode } from './Waveform';
import Writeup, { REPO } from './Writeup';
import { wakeAudio } from './audio';
import { EMPTY_VIEW, NO_ACTIONS, mmss, type CallActions, type CallView, type Phase } from './events';
import { HARVEY_CSS } from './styles';


const ASKS = [
  { label: 'renting', q: 'can my landlord evict me so his son can move in?' },
  { label: 'driving', q: 'i got pulled over doing 50 over. what happens now?' },
  { label: 'work', q: 'can my boss fire me without any notice?' },
  { label: 'cannabis', q: 'can i drive the morning after smoking?' },
];

const STATUS: Record<Phase, string> = {
  idle: 'harvey is at his desk',
  dialing: 'dialing harvey',
  connecting: 'connecting',
  listening: 'harvey is listening',
  thinking: 'harvey is thinking',
  speaking: 'harvey is talking',
  silent: 'harvey isn\'t talking',
  ending: 'hanging up',
  ended: 'call ended',
};

const WAVE: Record<Phase, WaveMode> = {
  idle: 'idle', dialing: 'connecting', connecting: 'connecting', listening: 'listening', thinking: 'thinking',
  speaking: 'speaking', silent: 'listening', ending: 'ended', ended: 'ended',
};

type Stage = 'idle' | 'dialing' | 'call' | 'ended';
interface Conn { token: string; url: string }

function isPreview() {
  if (!import.meta.env.DEV) return false;
  try { return new URLSearchParams(location.search).get('preview') === '1'; } catch { return false; }
}

const rise = (i: number) => ({ '--i': i }) as CSSProperties;

function Reveal({ open, children, className = '' }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`hv-reveal ${className}`} data-open={open} aria-hidden={!open} inert={!open}>
      <div className="hv-reveal-in">{children}</div>
    </div>
  );
}

function Swap({ items, current, className = '' }: { items: string[]; current: string; className?: string }) {
  return (
    <span className={`hv-swap ${className}`}>
      {items.map((s) => <span key={s} className={s === current ? 'hv-swap-on' : ''} aria-hidden={s !== current}>{s}</span>)}
    </span>
  );
}

function useClock(on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [on]);
  return now;
}

export default function HarveyPage() {
  const [preview, setPreview] = useState(false);
  useEffect(() => setPreview(isPreview()), []);
  const [room] = useState(() => (typeof window === 'undefined' ? (null as unknown as Room) : new Room()));
  const [stage, setStage] = useState<Stage>('idle');
  const [conn, setConn] = useState<Conn | null>(null);
  const [callId, setCallId] = useState(0);
  const [view, setView] = useState<CallView>(EMPTY_VIEW);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startMs, setStartMs] = useState(0);
  const feed = useRef<WaveFeed>({ agent: null, mic: null, fake: null });
  const actions = useRef<CallActions>(NO_ACTIONS);
  const liveRef = useRef(false);
  const startRef = useRef(0);

  const live = stage === 'dialing' || stage === 'call';
  const now = useClock(live);
  const elapsed = live && startMs ? Math.max(0, Math.floor((now - startMs) / 1000)) : 0;
  const phase: Phase = stage === 'call' ? view.phase : stage;

  const endCall = useCallback((err?: string) => {
    if (!liveRef.current) return;
    liveRef.current = false;
    setDuration(startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0);
    setConn(null);
    actions.current = NO_ACTIONS;
    feed.current = { agent: null, mic: null, fake: null };
    if (err) { setError(err); setStage(startRef.current ? 'ended' : 'idle'); }
    else setStage('ended');
  }, []);

  const begin = useCallback(() => {
    startRef.current = Date.now();
    setStartMs(startRef.current);
    setView(EMPTY_VIEW);
    setCallId((n) => n + 1);
    setStage('call');
  }, []);

  const call = useCallback(() => {
    wakeAudio();
    room.startAudio().catch(() => {});
    setError(null);
    setStage('dialing');
    startRef.current = 0;
    setStartMs(0);
    liveRef.current = true;
    if (preview) {
      window.setTimeout(() => { if (liveRef.current) begin(); }, 700);
      return;
    }
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        throw new Error('harvey needs your microphone. allow it for this site and try again.');
      }
      const res = await fetch('/api/harvey/token', { cache: 'no-store' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.token || !body?.url) throw new Error(body?.error || 'could not reach harvey. try again in a minute.');
      if (!liveRef.current) return;
      setConn({ token: body.token, url: body.url });
      begin();
    })().catch((e) => endCall(e instanceof Error ? e.message : 'could not reach harvey. try again in a minute.'));
  }, [preview, room, begin, endCall]);

  const hangUp = useCallback(() => {
    if (stage === 'dialing') { endCall(); return; }
    actions.current.end();
  }, [stage, endCall]);

  const onView = useCallback((v: CallView) => setView(v), []);
  const onEnd = useCallback(() => endCall(), [endCall]);

  const mainLabel = stage === 'dialing' ? 'cancel' : stage === 'call' ? 'end call' : stage === 'ended' ? 'call again' : 'call harvey';
  const rightText = live ? mmss(elapsed) : stage === 'ended' ? mmss(duration) : 'ontario + federal law';
  const showSilent = stage === 'call' && view.phase === 'silent';
  const showTap = stage === 'call' && view.needsTap;

  return (
    <PageShell activePage="projects" crumb="harvey" back={{ href: '/projects', label: 'projects' }} wide>
      <div className={`site-col hv hv-stage-${stage}`} data-phase={phase}>
        <HarveyHero />

        <div className="hv-actions hv-rise" style={rise(1)}>
          <button className="hv-btn hv-btn-primary hv-main" onClick={live ? hangUp : call} aria-label={mainLabel}>
            <Swap items={['call harvey', 'cancel', 'end call', 'call again']} current={mainLabel} />
          </button>
          <div className="hv-slot" data-open={stage === 'call'}>
            <div className="hv-slot-in">
              <button className={`hv-btn${view.muted ? ' hv-btn-on' : ''}`} onClick={() => actions.current.toggleMute()} aria-pressed={view.muted} tabIndex={stage === 'call' ? 0 : -1}>
                <Swap items={['mute', 'unmute']} current={view.muted ? 'unmute' : 'mute'} />
              </button>
            </div>
          </div>
          <a className="hv-btn hv-code" href={REPO} target="_blank" rel="noopener noreferrer">read the code</a>
        </div>

        <Reveal open={!!error}>
          <p className="hv-error" role="alert">{error}</p>
        </Reveal>

        <section className="hv-full hv-line-panel hv-rise" style={rise(2)} aria-label="call">
          <div className="hv-status">
            <span className={`hv-dot hv-dot-${phase}`} aria-hidden />
            <Swap className="hv-label hv-status-label" items={Object.values(STATUS)} current={STATUS[phase]} />
            <span className="hv-status-right">
              <Swap items={[rightText]} current={rightText} />
            </span>
          </div>
          <div className="hv-wave" aria-live="polite">
            <Waveform mode={WAVE[phase]} feed={feed} label={STATUS[phase]} />
          </div>
          <Reveal open={showSilent || showTap}>
            <div className="hv-notice">
              {showTap && (
                <button className="hv-btn" onClick={() => actions.current.tapToHear()}>tap to hear harvey</button>
              )}
              {showSilent && <p>harvey joined but isn't talking. the voice service is down, not your mic.</p>}
            </div>
          </Reveal>
          <Reveal open={stage === 'ended' && !error}>
            <p className="hv-after">call ended after {mmss(duration)}. he is still at his desk.</p>
          </Reveal>
          <Reveal open={live}>
            <CallStage view={stage === 'call' ? view : { ...EMPTY_VIEW, phase }} startMs={startMs} actions={actions.current} />
          </Reveal>
        </section>

        <section className={`hv-full hv-extras hv-rise${live ? ' hv-dim' : ''}`} style={rise(3)}>
          <div className="hv-label hv-asks-label">things to ask him</div>
          <div className="hv-ask-grid">
            {ASKS.map((a) => (
              <div key={a.label} className="hv-ask">
                <div className="hv-label">{a.label}</div>
                <div className="hv-ask-q">"{a.q}"</div>
              </div>
            ))}
          </div>
          <p className="hv-fine">uses your microphone. calls cap at ten minutes. not legal advice, he just sounds like it.</p>
        </section>

        <div className="hv-full hv-rise" style={rise(4)}>
          <Writeup />
        </div>

        {stage === 'call' && preview && (
          <PreviewCall key={callId} startMs={startMs} feed={feed} actions={actions} onView={onView} onEnd={onEnd} />
        )}
        {!preview && (
          <LiveKitRoom
            className="hv-room"
            room={room}
            token={conn?.token}
            serverUrl={conn?.url}
            connect={!!conn}
            audio={!!conn}
            video={false}
            onDisconnected={() => endCall()}
            onError={() => endCall('the line dropped. call again.')}
            onMediaDeviceFailure={() => endCall('harvey needs your microphone. allow it for this site and try again.')}
          >
            {conn && stage === 'call' && <LiveCall key={callId} startMs={startMs} feed={feed} actions={actions} onView={onView} onEnd={onEnd} />}
          </LiveKitRoom>
        )}
      </div>
      <style>{HARVEY_CSS}</style>
    </PageShell>
  );
}
