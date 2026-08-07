import React, { useState, useRef, useCallback } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  threshold?: number;
  minDurationMs?: number;
}

const RefreshIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6" />
    <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M2.5 16l1.2 0.8A10 10 0 0 0 22 12.5" />
  </svg>
);

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  className = '',
  threshold = 65,
  minDurationMs = 800
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  const handleStart = (clientY: number) => {
    if (disabled || isRefreshing || !isAtTop()) return;
    startYRef.current = clientY;
    isDraggingRef.current = true;
  };

  const handleMove = (clientY: number) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;
    const dy = clientY - startYRef.current;
    if (dy > 0 && isAtTop()) {
      // Rubberband dampening
      const distance = Math.min(dy * 0.45, threshold * 1.4);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleEnd = async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Hold spinner position during refresh

      const minTimer = new Promise((resolve) => setTimeout(resolve, minDurationMs));

      try {
        await Promise.all([Promise.resolve(onRefresh()), minTimer]);
      } catch (err) {
        console.error('[PullToRefresh] Refresh error:', err);
        await minTimer;
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const pullRatio = Math.min(pullDistance / threshold, 1);
  const rotateDeg = pullRatio * 180;
  const isVisible = pullDistance > 0 || isRefreshing;

  return (
    <div
      className={`relative touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Pull Refresh Floating Badge (Appears right above list items) */}
      <div 
        className={`w-full flex items-center justify-center pointer-events-none transition-all duration-250 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          height: isVisible ? '44px' : '0px',
          marginBottom: isVisible ? '8px' : '0px',
          overflow: 'hidden'
        }}
      >
        <div 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(15,23,42,0.1)] border border-slate-900/10 text-primary transition-transform duration-150"
          style={{
            transform: `scale(${Math.max(0.6, pullRatio)})`
          }}
        >
          <RefreshIcon 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-primary' : 'text-slate-600'}`} 
            {...(!isRefreshing ? { style: { transform: `rotate(${rotateDeg}deg)` } } : {})}
          />
        </div>
      </div>

      {/* List items wrapper with spring translate */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance > 0 ? Math.min(pullDistance * 0.3, 24) : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}
