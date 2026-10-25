"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "connecting" | "connected" | "error";

export default function YanayCommercialVoice() {
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const connectingRef = useRef(false);

  function disconnect() {
    pcRef.current?.close();
    pcRef.current = null;
    micRef.current?.getTracks().forEach(track => track.stop());
    micRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    connectingRef.current = false;
    setStatus("idle");
    setMuted(false);
  }

  useEffect(() => () => {
    pcRef.current?.close();
    micRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  async function connect() {
    if (connectingRef.current || pcRef.current) return;
    connectingRef.current = true;
    setStatus("connecting");
    setError("");
    let pc: RTCPeerConnection | null = null;
    let mic: MediaStream | null = null;
    try {
      mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = mic;
      const tokenResponse = await fetch("/api/yanay-commercial/voice-session", {
        method: "POST", credentials: "same-origin"
      });
      if (!tokenResponse.ok) throw new Error("No se pudo iniciar la sesión de voz.");
      const token = await tokenResponse.json();
      if (typeof token.client_secret !== "string") throw new Error("Sesión de voz inválida.");
      pc = new RTCPeerConnection();
      pcRef.current = pc;
      const audio = audioRef.current;
      pc.ontrack = event => {
        if (audio) {
          audio.srcObject = event.streams[0];
          void audio.play().catch(() => setError("Activa el audio para escuchar a Yanay."));
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc?.connectionState === "failed" || pc?.connectionState === "disconnected") {
          setError("La conexión de voz se interrumpió.");
          disconnect();
        }
      };
      mic.getTracks().forEach(track => pc!.addTrack(track, mic!));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const response = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${token.client_secret}`, "Content-Type": "application/sdp" },
        body: offer.sdp
      });
      if (!response.ok) throw new Error("No fue posible establecer la llamada.");
      await pc.setRemoteDescription({ type: "answer", sdp: await response.text() });
      setStatus("connected");
    } catch (e) {
      pc?.close();
      mic?.getTracks().forEach(track => track.stop());
      pcRef.current = null;
      micRef.current = null;
      setError(e instanceof Error ? e.message : "Error al iniciar la llamada.");
      setStatus("error");
    } finally {
      connectingRef.current = false;
    }
  }

  function toggleMute() {
    const next = !muted;
    micRef.current?.getAudioTracks().forEach(track => { track.enabled = !next; });
    setMuted(next);
  }

  return (
    <section aria-label="Yanay Comercial IA" style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 20, maxWidth: 380 }}>
      <h2>Habla con Yanay</h2>
      <p>Asesora comercial virtual de EducAntay, impulsada por inteligencia artificial.</p>
      <audio ref={audioRef} autoPlay playsInline />
      <p role="status">{status === "connected" ? "Conversación activa" : status === "connecting" ? "Conectando..." : "Lista para conversar"}</p>
      {error && <p role="alert">{error}</p>}
      {status === "connected" ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={toggleMute}>{muted ? "Activar micrófono" : "Silenciar micrófono"}</button>
          <button type="button" onClick={disconnect}>Finalizar conversación</button>
        </div>
      ) : (
        <button type="button" disabled={status === "connecting"} onClick={connect}>
          {status === "connecting" ? "Conectando..." : "Hablar con Yanay"}
        </button>
      )}
      <small>Al iniciar, tu navegador solicitará permiso para usar el micrófono.</small>
    </section>
  );
}
