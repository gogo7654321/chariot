
'use client';

import React, { useState, useEffect } from 'react';
import { useAppearance } from '@/contexts/AppearanceContext';

const random = (min: number, max: number) => Math.random() * (max - min) + min;

interface Star {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  animationName: string;
}

interface ShootingStar {
  id: number;
  right: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export function StarryNightBackground() {
  const { customTheme } = useAppearance();
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  const shouldRender = customTheme?.id === 'starry-night';

  useEffect(() => {
    if (!shouldRender || typeof window === 'undefined') {
      setStars([]);
      setShootingStars([]);
      return;
    }

    const generateStars = () => {
      const canvasSize = window.innerWidth * window.innerHeight;
      const starsFraction = Math.floor(canvasSize / 4000);
      const newStars: Star[] = [];
      for (let i = 0; i < starsFraction; i++) {
        newStars.push({
          id: i,
          left: `${random(0, 99)}%`,
          top: `${random(0, 99)}%`,
          size: Math.random() < 0.5 ? 1 : 2,
          opacity: random(0.5, 1),
          animationName: Math.random() < 1 / 5 ? `twinkle${Math.floor(random(1, 5))}` : 'none',
        });
      }
      setStars(newStars);
    };

    const generateShootingStars = () => {
        const newShootingStars: ShootingStar[] = [];
        for (let i = 0; i < 4; i++) {
            newShootingStars.push({
                id: i,
                right: `${random(0, 90)}%`,
                top: '-4px',
                animationDelay: `${random(0, 7)}s`,
                animationDuration: `${random(3, 6)}s`,
            });
        }
        setShootingStars(newShootingStars);
    };

    generateStars();
    generateShootingStars();

    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);
  }, [shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <div className="starry-background" aria-hidden="true">
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              backgroundColor: 'hsl(var(--custom-accent))',
              borderRadius: '50%',
              animationName: star.animationName,
              animationDuration: '5s',
              animationIterationCount: 'infinite',
            }}
          />
        ))}
      </div>
      <div className="shooting-star-container" aria-hidden="true">
        {shootingStars.map((star) => (
            <span 
              key={star.id} 
              className="shootingstar"
              style={{
                  top: star.top,
                  right: star.right,
                  animationDelay: star.animationDelay,
                  animationDuration: star.animationDuration,
              }}
            />
        ))}
      </div>
    </>
  );
}
