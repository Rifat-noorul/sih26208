import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { Zap, Eye, EyeOff } from 'lucide-react';

interface MobileControlsProps {
  isMobileLayout?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ isMobileLayout = false }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);

  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarrying = Boolean(isCarryingStoneStore || carryingStone);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPlayerCrouched = useGameStore((state) => state.isPlayerCrouched);
  const setIsPlayerCrouched = useGameStore((state) => state.setIsPlayerCrouched);
  const gameState = useGameStore((state) => state.gameState);

  const stoneSupplyPos = useRef(new THREE.Vector3(-6.0, 9.1, 1.2)).current;
  const distToSupply = playerPosition ? playerPosition.distanceTo(stoneSupplyPos) : 99;
  const isNearSupply = distToSupply <= 2.5;

  // Active key state tracking
  const activeKeysRef = useRef<{ w: boolean; a: boolean; s: boolean; d: boolean }>({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  const dispatchKey = useCallback((code: string, pressed: boolean) => {
    const event = new KeyboardEvent(pressed ? 'keydown' : 'keyup', {
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  }, []);

  const releaseAllKeys = useCallback(() => {
    if (activeKeysRef.current.w) { activeKeysRef.current.w = false; dispatchKey('KeyW', false); }
    if (activeKeysRef.current.a) { activeKeysRef.current.a = false; dispatchKey('KeyA', false); }
    if (activeKeysRef.current.s) { activeKeysRef.current.s = false; dispatchKey('KeyS', false); }
    if (activeKeysRef.current.d) { activeKeysRef.current.d = false; dispatchKey('KeyD', false); }
  }, [dispatchKey]);

  const updateJoystickFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 12;

    let clampedX = dx;
    let clampedY = dy;
    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius;
      clampedY = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;
    const threshold = 0.22;

    const nextW = normY < -threshold;
    const nextS = normY > threshold;
    const nextA = normX < -threshold;
    const nextD = normX > threshold;

    if (activeKeysRef.current.w !== nextW) { activeKeysRef.current.w = nextW; dispatchKey('KeyW', nextW); }
    if (activeKeysRef.current.s !== nextS) { activeKeysRef.current.s = nextS; dispatchKey('KeyS', nextS); }
    if (activeKeysRef.current.a !== nextA) { activeKeysRef.current.a = nextA; dispatchKey('KeyA', nextA); }
    if (activeKeysRef.current.d !== nextD) { activeKeysRef.current.d = nextD; dispatchKey('KeyD', nextD); }
  }, [dispatchKey]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateJoystickFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateJoystickFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePointerIdRef.current === e.pointerId) {
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      activePointerIdRef.current = null;
      releaseAllKeys();
    }
  };

  useEffect(() => {
    return () => {
      releaseAllKeys();
    };
  }, [releaseAllKeys]);

  const handleActionClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('trigger-rock-release'));
  };

  const toggleCrouch = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlayerCrouched(!isPlayerCrouched);
  };

  if (!isMobileLayout && gameState !== 'PLAYING') return null;

  return (
    <div className="mobile-controls-overlay" style={{ touchAction: 'none' }}>
      {/* BOTTOM-LEFT: Virtual Movement Joystick */}
      <div
        className={`virtual-joystick-base ${isDragging ? 'dragging' : ''}`}
        ref={joystickRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <div
          className="virtual-joystick-knob"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
        <div className="joystick-center-dot" />
        <span className="joystick-sub-label">MOVE</span>
      </div>

      {/* BOTTOM-RIGHT: Mobile Tactical Action Controls */}
      <div className="mobile-action-group" style={{ touchAction: 'none' }}>
        {/* Crouch Stance Toggle Button */}
        <button
          className={`mobile-crouch-btn ${isPlayerCrouched ? 'crouched' : ''}`}
          onClick={toggleCrouch}
          onTouchEnd={toggleCrouch}
          title="Toggle Crouch Stance"
        >
          {isPlayerCrouched ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>CROUCH</span>
        </button>

        {/* Primary Tactical Action Button (E) */}
        <button
          className={`mobile-action-btn ${isCarrying ? 'carrying' : isNearSupply ? 'near-supply' : ''}`}
          onClick={handleActionClick}
          onTouchEnd={handleActionClick}
          title="Tactical Action"
        >
          <div className="btn-glow-ring" />
          <Zap size={22} className="btn-zap-icon" />
          <span className="btn-letter">E</span>
          <span className="btn-caption">
            {isCarrying ? 'THROW' : isNearSupply ? 'COLLECT' : 'ACTION'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
