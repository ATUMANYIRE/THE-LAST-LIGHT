'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, Play, Film } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface CinematicIntroProps {
  onComplete?: () => void;
  autoPlay?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  autoPlay = true,
}) => {
  const { settings } = useGameStore();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // If user prefers reduced motion, skip auto-play
  useEffect(() => {
    if (settings.reducedMotion) {
      setIsDismissed(true);
      onComplete?.();
      return;
    }

    if (autoPlay && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy prevented playback; wait for user click
          setIsPlaying(false);
        });
    }
  }, [autoPlay, settings.reducedMotion, onComplete]);

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsDismissed(true);
    onComplete?.();
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  if (isDismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight-950/95 backdrop-blur-xl transition-opacity duration-700"
      role="dialog"
      aria-modal="true"
      aria-label="Opening Cinematic"
      data-testid="cinematic-intro"
    >
      <div className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto p-4 flex flex-col items-center justify-center">
        {/* Cinematic Video Container */}
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-midnight-700/80 shadow-2xl bg-black">
          {!hasError ? (
            <video
              ref={videoRef}
              src="/cinematics/opening.mp4"
              className="w-full h-full object-cover"
              playsInline
              muted={isMuted}
              onEnded={handleSkip}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-midnight-900 to-midnight-950">
              <Film className="w-16 h-16 text-glow-amber mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                THE LAST LIGHT
              </h2>
              <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                A city isn&apos;t truly connected until everyone can find their way home.
                Step into the Old Clocktower Quarter as night begins to fall.
              </p>
              <button
                onClick={handleSkip}
                data-testid="enter-3d-world-button"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-glow-amber to-amber-600 text-midnight-950 font-bold text-sm shadow-lg hover:brightness-110 transition cursor-pointer"
              >
                Enter the 3D City
              </button>
            </div>
          )}

          {/* Cinematic Overlay Title Banner */}
          <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-glow-warm uppercase block mb-1">
                Prologue Cinematic
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight drop-shadow-md">
                THE LAST LIGHT
              </h1>
            </div>
          </div>

          {/* Cinematic Bottom Subtitle & Interactive Controls */}
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-300 italic text-center sm:text-left drop-shadow">
              &ldquo;A city isn&apos;t truly connected until everyone can find their way home.&rdquo;
            </p>

            <div className="flex items-center space-x-3 pointer-events-auto">
              {!hasError && (
                <>
                  <button
                    onClick={handleTogglePlay}
                    className="p-2.5 rounded-full bg-midnight-900/80 hover:bg-midnight-800 text-slate-200 border border-midnight-700/60 transition cursor-pointer"
                    aria-label={isPlaying ? 'Pause cinematic' : 'Play cinematic'}
                  >
                    <Play
                      className={`w-4 h-4 ${isPlaying ? 'opacity-50' : 'text-glow-amber'}`}
                    />
                  </button>

                  <button
                    onClick={handleToggleMute}
                    className="p-2.5 rounded-full bg-midnight-900/80 hover:bg-midnight-800 text-slate-200 border border-midnight-700/60 transition cursor-pointer"
                    aria-label={isMuted ? 'Unmute cinematic' : 'Mute cinematic'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-civic-sky" />
                    )}
                  </button>
                </>
              )}

              <button
                onClick={handleSkip}
                data-testid="skip-cinematic-button"
                className="px-5 py-2.5 rounded-full bg-glow-amber hover:bg-amber-400 text-midnight-950 font-bold text-xs shadow-lg flex items-center space-x-2 transition cursor-pointer"
              >
                <span>Enter Chapter 1</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
