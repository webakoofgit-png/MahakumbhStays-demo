import { useEffect, useRef, useState } from "react";
import { Pause, Play, VolumeX } from "lucide-react";

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const userRequestedPlay = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const sync = () => {
      element.muted = true;
      element.defaultMuted = true;
      if (
        document.hidden ||
        !visible ||
        (preference.matches && !userRequestedPlay.current) ||
        userPaused.current
      ) {
        element.pause();
      } else {
        void element.play().catch(() => setPlaying(false));
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.05 },
    );
    if (frame.current) observer.observe(frame.current);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    element.addEventListener("canplay", sync);
    sync();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.removeEventListener("canplay", sync);
      element.pause();
    };
  }, []);
  function toggle() {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      userPaused.current = false;
      userRequestedPlay.current = true;
      void element.play().catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      element.pause();
    }
  }
  return (
    <div className="hero-media" ref={frame}>
      <video
        ref={video}
        className="hero-video"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/kumbh-mela-poster.jpg"
        aria-label="Muted aerial footage of the Kumbh Mela gathering in Prayagraj"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      >
        <source src="/videos/kumbh-mela.mp4" type="video/mp4" />
      </video>
      {failed && (
        <img
          className="hero-video-fallback"
          src="/videos/kumbh-mela-poster.jpg"
          alt="Pilgrims crossing pontoon bridges at Kumbh Mela in Prayagraj"
        />
      )}
      <div className="hero-video-topline">
        <span>
          <span /> KUMBH MELA · A GLIMPSE OF THE GATHERING
        </span>
        <span className="video-muted-label">
          <VolumeX size={13} /> Muted
        </span>
      </div>
      {!failed && (
        <button
          className="hero-video-toggle"
          type="button"
          aria-label={playing ? "Pause Kumbh Mela video" : "Play Kumbh Mela video"}
          onClick={toggle}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
      )}
    </div>
  );
}
