'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { clearTouchInput, getTouchDirection, pressTouchDirection, releaseTouchPointer, TouchDirection } from '../../engine/touchInput';

const directions: { direction: TouchDirection; symbol: string; position: string }[] = [
  { direction: 'forward', symbol: '↑', position: 'col-start-2 row-start-1' },
  { direction: 'left', symbol: '←', position: 'col-start-1 row-start-2' },
  { direction: 'right', symbol: '→', position: 'col-start-3 row-start-2' },
  { direction: 'backward', symbol: '↓', position: 'col-start-2 row-start-3' },
];

export function TouchDPad() {
  const [pressed, setPressed] = useState<TouchDirection[]>([]);
  const syncPressed = () => {
    const active = getTouchDirection();
    setPressed(directions.filter(item => active[item.direction]).map(item => item.direction));
  };
  const {
    gameMode, isSimulating, showIntroModal, showRevealModal, showVictoryModal,
    showFailureModal, showSettingsModal, showHelpModal, showChapterSelect, showFinaleModal,
  } = useGameStore();
  const blocked = gameMode !== 'explore' || isSimulating || showIntroModal || showRevealModal ||
    showVictoryModal || showFailureModal || showSettingsModal || showHelpModal ||
    showChapterSelect || showFinaleModal;

  useEffect(() => {
    if (blocked) {
      clearTouchInput();
      setPressed([]);
    }
  }, [blocked]);

  useEffect(() => {
    const clear = () => { clearTouchInput(); setPressed([]); };
    window.addEventListener('blur', clear);
    return () => { window.removeEventListener('blur', clear); clearTouchInput(); };
  }, []);

  if (blocked) return null;

  return (
    <div
      data-testid="touch-dpad"
      aria-label="Explore movement controls"
      className="fixed left-3 z-40 grid grid-cols-3 grid-rows-3 gap-1 md:hidden"
      style={{ bottom: '8.5rem', touchAction: 'none', userSelect: 'none' }}
      onTouchCancel={() => { clearTouchInput(); setPressed([]); }}
    >
      {directions.map(({ direction, symbol, position }) => (
        <button
          key={direction}
          type="button"
          data-testid={`touch-${direction}`}
          aria-label={`Move ${direction}`}
          aria-pressed={pressed.includes(direction)}
          className={`${position} h-12 w-12 rounded-xl border text-xl font-semibold text-white shadow-lg active:scale-95`}
          style={{
            background: pressed.includes(direction) ? 'rgba(181,154,103,0.95)' : 'rgba(37,52,59,0.88)',
            borderColor: pressed.includes(direction) ? '#F6F3EB' : 'rgba(221,215,203,0.45)',
            touchAction: 'none',
          }}
          onPointerDown={event => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            pressTouchDirection(event.pointerId, direction);
            syncPressed();
          }}
          onPointerUp={event => {
            releaseTouchPointer(event.pointerId);
            syncPressed();
          }}
          onPointerCancel={event => {
            releaseTouchPointer(event.pointerId);
            syncPressed();
          }}
          onLostPointerCapture={event => {
            releaseTouchPointer(event.pointerId);
            syncPressed();
          }}
        >{symbol}</button>
      ))}
    </div>
  );
}
