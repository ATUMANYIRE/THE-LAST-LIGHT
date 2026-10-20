'use client';

import React, { useState, useEffect } from 'react';
import { soundEngine } from '../../engine/audio';
import { useGameStore } from '../../store/gameStore';
import { Subtitles } from 'lucide-react';

export const AudioCaptions: React.FC = () => {
  const { settings } = useGameStore();
  const [caption, setCaption] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribeCaptions((cap) => {
      setCaption(cap);
      const timer = setTimeout(() => {
        setCaption((prev) => (prev?.text === cap.text ? null : prev));
      }, 3000);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  if (!settings.captionsEnabled || !caption) return null;

  return (
    <aside
      aria-label="Sound Captions"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-midnight-950/90 border border-glow-amber/50 text-slate-100 text-xs font-medium flex items-center space-x-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <Subtitles className="w-3.5 h-3.5 text-glow-amber" />
      <span>{caption.text}</span>
    </aside>
  );
};
