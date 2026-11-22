import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
  RoomAudioRenderer,
  useAudioPlayback,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react';
import { tapTrack } from './audio';
import { decodeEvent, mergeTranscript, usePanes, type CallActions, type CallView, type Phase, type Utterance } from './events';
import type { WaveFeed } from './Waveform';

const NUDGE_SILENCE_MS = 28_000;
const NUDGE_COOLDOWN_MS = 45_000;
const SILENT_AFTER_MS = 8_000;

function toPhase(state: string): Phase {
  if (state === 'speaking') return 'speaking';
  if (state === 'thinking') return 'thinking';
  if (state === 'listening' || state === 'idle') return 'listening';
  return 'connecting';
}

function useTap(track: MediaStreamTrack | undefined, feed: MutableRefObject<WaveFeed>, slot: 'agent' | 'mic') {
  useEffect(() => {
    if (!track) return;
    const tap = tapTrack(track);
    if (!tap) return;
    feed.current[slot] = tap.analyser;
    return () => {
      tap.stop();
      if (feed.current[slot] === tap.analyser) feed.current[slot] = null;
    };
  }, [track, feed, slot]);
}

interface Props {
  startMs: number;
  feed: MutableRefObject<WaveFeed>;
  actions: MutableRefObject<CallActions>;
  onView: (v: CallView) => void;
  onEnd: () => void;
}

export default function LiveCall({ startMs, feed, actions, onView, onEnd }: Props) {
  const [muted, setMuted] = useState(false);
  const [ending, setEnding] = useState(false);
  const [joinedAt, setJoinedAt] = useState(0);
  const [silent, setSilent] = useState(false);
  const heardRef = useRef(false);

  const connection = useConnectionState();
  const { state: vaState, agent, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const streams = useTranscriptions();
  const { canPlayAudio, startAudio } = useAudioPlayback();

  const finish = useCallback((delay: number) => {
    setEnding(true);
    window.setTimeout(onEnd, delay);
  }, [onEnd]);

  const { panes, tools, focusedId, scrollId, handle, openSeeAlso, dismiss } = usePanes(() => finish(1800));

  useDataChannel((msg) => {
    const evt = decodeEvent(msg.payload);
    if (evt) handle(evt);
  });

  const { agentLines, userLines } = useMemo(() => {
    const me = localParticipant?.identity;
    const a: Utterance[] = [];
    const u: Utterance[] = [];
    for (const s of streams) {
      const item = { text: s.text, firstReceivedTime: s.streamInfo.timestamp };
      if (me && s.participantInfo.identity === me) u.push(item);
      else a.push(item);
    }
    return { agentLines: a.length ? a : agentTranscriptions, userLines: u };
  }, [streams, agentTranscriptions, localParticipant?.identity]);

  const lines = useMemo(() => mergeTranscript(agentLines, userLines), [agentLines, userLines]);

  useTap(audioTrack?.publication?.track?.mediaStreamTrack, feed, 'agent');
  useTap(microphoneTrack?.track?.mediaStreamTrack, feed, 'mic');

  useEffect(() => {
    if (agent && !joinedAt) setJoinedAt(Date.now());
  }, [agent, joinedAt]);

  if (vaState === 'speaking' || agentLines.some((l) => (l.text ?? '').trim())) heardRef.current = true;

  useEffect(() => {
    if (!joinedAt) return;
    let probe = new Uint8Array(2048);
    const id = window.setInterval(() => {
      const an = feed.current.agent;
      if (an && !heardRef.current) {
        if (probe.length !== an.fftSize) probe = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(probe);
        let peak = 0;
        for (let i = 0; i < probe.length; i++) peak = Math.max(peak, Math.abs(probe[i] - 128));
        if (peak > 6) heardRef.current = true;
      }
      if (heardRef.current) { setSilent(false); return; }
      if (Date.now() - joinedAt > SILENT_AFTER_MS) setSilent(true);
    }, 400);
    return () => window.clearInterval(id);
  }, [joinedAt, feed]);

  const lastNudgeRef = useRef(0);
  const activityRef = useRef({ agentLines, userLines });
  activityRef.current = { agentLines, userLines };
  useEffect(() => {
    if (!localParticipant) return;
    const id = window.setInterval(() => {
      if (ending) return;
      if (vaState === 'speaking' || vaState === 'thinking') return;
      const now = Date.now();
      const latest = (arr: Utterance[]) => arr.reduce((m, x) => Math.max(m, x.firstReceivedTime ?? 0), startMs);
      const since = now - Math.max(latest(activityRef.current.userLines), latest(activityRef.current.agentLines));
      if (since < NUDGE_SILENCE_MS || now - lastNudgeRef.current < NUDGE_COOLDOWN_MS) return;
      localParticipant
        .publishData(new TextEncoder().encode(JSON.stringify({ type: 'idle_nudge' })), { reliable: true })
        .catch(() => {});
      lastNudgeRef.current = now;
    }, 5000);
    return () => window.clearInterval(id);
  }, [ending, vaState, localParticipant, startMs]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      localParticipant?.setMicrophoneEnabled(prev).catch(() => {});
      return !prev;
    });
  }, [localParticipant]);

  actions.current = {
    toggleMute,
    end: () => finish(420),
    dismiss,
    openSeeAlso,
    tapToHear: () => { startAudio().catch(() => {}); },
  };

  const phase: Phase = ending
    ? 'ending'
    : connection !== 'connected' || !agent
      ? 'connecting'
      : silent && !heardRef.current
        ? 'silent'
        : toPhase(vaState);
  const needsTap = connection === 'connected' && !canPlayAudio;

  useEffect(() => {
    onView({ phase, lines, panes, tools, focusedId, scrollId, muted, needsTap });
  }, [onView, phase, lines, panes, tools, focusedId, scrollId, muted, needsTap]);

  return <RoomAudioRenderer />;
}
