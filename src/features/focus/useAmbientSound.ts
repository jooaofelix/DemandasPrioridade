import { useEffect, useRef, useState } from "react";

/**
 * Som ambiente opcional: um tom baixo e contínuo gerado localmente (Web Audio API),
 * sem depender de arquivos de áudio externos.
 */
export function useAmbientSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  function stop() {
    oscRef.current?.stop();
    oscRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
  }

  function toggle() {
    if (enabled) {
      stop();
      setEnabled(false);
      return;
    }
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 174;
    gain.gain.value = 0.025;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx;
    oscRef.current = osc;
    setEnabled(true);
  }

  useEffect(() => stop, []);

  return { enabled, toggle };
}
