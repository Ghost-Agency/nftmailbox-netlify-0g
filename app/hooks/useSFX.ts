'use client';

import { useCallback, useRef, useEffect } from 'react';

export function useSFX() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction to bypass autoplay restrictions
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playClick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const playMoltSequence = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    
    // Low hum ramping up (Sci-Fi / Compilation feeling)
    osc1.frequency.setValueAtTime(55, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 2);
    
    osc2.frequency.setValueAtTime(55.5, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(222, ctx.currentTime + 2);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 2);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 2);
    osc2.stop(ctx.currentTime + 2);
  }, []);

  const playSuccess = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'sine';

    // Triumphant Major chord arpeggio
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5 

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.1);
    osc3.start(ctx.currentTime + 0.2);

    osc1.stop(ctx.currentTime + 1.5);
    osc2.stop(ctx.currentTime + 1.5);
    osc3.stop(ctx.currentTime + 1.5);
  }, []);

  return { playClick, playMoltSequence, playSuccess };
}
