import { useState, useRef, useCallback, useEffect } from 'react';
import { addEntry, classifyDb, type SilenceEntry } from './store';

export function useAudio() {
  const [isListening, setIsListening] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [level, setLevel] = useState<SilenceEntry['level']>('silent');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const segmentStartRef = useRef<number>(0);
  const dbSamplesRef = useRef<number[]>([]);

  const SEGMENT_MS = 5000; // save an entry every 5 seconds

  const processAudio = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);

    // RMS -> dB (calibrated rough approximation)
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
    const rms = Math.sqrt(sum / data.length);
    // Map to approximate dB SPL (very rough, mic-dependent)
    const db = Math.max(0, Math.min(120, 20 * Math.log10(rms + 1e-10) + 90));

    setCurrentDb(Math.round(db));
    setLevel(classifyDb(db));
    dbSamplesRef.current.push(db);

    const now = Date.now();
    if (now - segmentStartRef.current >= SEGMENT_MS && dbSamplesRef.current.length > 0) {
      const samples = dbSamplesRef.current;
      const avgDb = samples.reduce((a, b) => a + b, 0) / samples.length;
      addEntry({
        timestamp: segmentStartRef.current,
        durationMs: now - segmentStartRef.current,
        avgDb: Math.round(avgDb),
        level: classifyDb(avgDb),
      });
      dbSamplesRef.current = [];
      segmentStartRef.current = now;
    }

    rafRef.current = requestAnimationFrame(processAudio);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      streamRef.current = stream;
      segmentStartRef.current = Date.now();
      dbSamplesRef.current = [];

      setIsListening(true);
      rafRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, [processAudio]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    analyserRef.current = null;
    setIsListening(false);
    setCurrentDb(0);
    setLevel('silent');
  }, []);

  useEffect(() => () => { if (isListening) stop(); }, [isListening, stop]);

  return { isListening, currentDb, level, start, stop };
}
