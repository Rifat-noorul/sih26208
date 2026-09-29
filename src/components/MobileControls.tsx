import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../utils/i18n';
import { Zap, Eye, EyeOff } from 'lucide-react';

/**
 * Mobile Virtual Joystick & Touch Action Controls Overlay
 * Renders on touch devices or mobile landscape views
 */
export default function MobileControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const carryingStone = useGameStore((state) => state.carryingStone);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPlayerCrouched = useGameStore((state) => state.isPlayerCrouched);
  const setIsPlayerCrouched = useGameStore((state) => state.setIsPlayerCrouched);
  const language = useGameStore((state) => state.language);
  const t = translations[language] || translations.en;

  // Distance to throw point [0, 9.1, 1.2]
  const distToThrow = playerPosition.distanceTo(new THREE_Vector3_Dummy(0, 9.1, 1.2));
  const isAtThrowPoint = distToThrow <= 2.8;

  // Detect touch support or screen size
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900;
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Dispatch Keyboard Events to existing WASD movement system
  const dispatchKey = (code: string, pressed: boolean) => {
    const event = new KeyboardEvent(pressed ? 'keydown' : 'keyup', {
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        touchIdRef.current = null;
        // Release all WASD keys
        dispatchKey('KeyW', false);
        dispatchKey('KeyS', false);
        dispatchKey('KeyA', false);
        dispatchKey('KeyD', false);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 10;

    let clampedX = dx;
    let clampedY = dy;
    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius;
      clampedY = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalize input between -1 and 1
    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;
    const threshold = 0.25;

    dispatchKey('KeyW', normY < -threshold);
    dispatchKey('KeyS', normY > threshold);
    dispatchKey('KeyA', normX < -threshold);
    dispatchKey('KeyD', normX > threshold);
  };

  const handleActionClick = () => {
    window.dispatchEvent(new CustomEvent('trigger-rock-release'));
  };

  const toggleCrouch = () => {
    setIsPlayerCrouched(!isPlayerCrouched);
  };

  if (!isTouchDevice) return null;

  return (
    <div className="mobile-controls-layer">
      {/* LEFT: Virtual Movement Joystick */}
      <div
        className="joystick-base"
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="joystick-knob"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
        <div className="joystick-label">WASD</div>
      </div>

      {/* RIGHT: Action Buttons */}
      <div className="mobile-action-group">
        {/* Crouch Button */}
        <button className={`mobile-btn mobile-btn-crouch ${isPlayerCrouched ? 'active' : ''}`} onClick={toggleCrouch}>
          {isPlayerCrouched ? <EyeOff size={20} /> : <Eye size={20} />}
          <span>C</span>
        </button>

        {/* Large Action E Button */}
        <button
          className={`mobile-btn mobile-btn-e ${carryingStone && isAtThrowPoint ? 'btn-ready' : ''}`}
          onClick={handleActionClick}
        >
          <Zap size={24} />
          <span className="btn-main-text">E</span>
          <span className="btn-sub-text">
            {carryingStone
              ? isAtThrowPoint
                ? t.pressE
                : t.returnToThrow
              : t.getStone}
          </span>
        </button>
      </div>
    </div>
  );
}

// Helper Vector3 dummy for distance check inside standalone file
class THREE_Vector3_Dummy {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
