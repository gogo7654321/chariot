
"use client";

import { useState, useEffect } from 'react';

const calculateTimeLeft = (examDate: string) => {
  const difference = +new Date(examDate) - +new Date();
  let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number; milliseconds?: number } = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      milliseconds: Math.floor(difference % 1000),
    };
  }

  return timeLeft;
};

export function CountdownTimer({ examDate, compact = false }: { examDate: string; compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<{ days?: number; hours?: number; minutes?: number; seconds?: number; milliseconds?: number }>({});

  useEffect(() => {
    // Set initial value on client mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft(examDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(examDate));
    }, compact ? 1000 : 47); // Update every second for compact, faster for detailed

    return () => clearInterval(timer);
  }, [examDate, compact]);

  const formatNum = (num: number) => String(num).padStart(2, '0');

  if (compact) {
    return (
      <div className="text-center">
        <p className="font-medium text-xs text-muted-foreground -mb-0.5">Exam In</p>
        {timeLeft.days !== undefined ? (
          <div className="flex justify-center gap-1.5 font-bold text-primary text-sm">
            <div className="flex items-baseline">
              <span>{timeLeft.days}</span>
              <span className="text-xs font-normal">d</span>
            </div>
            <div className="flex items-baseline">
              <span>{timeLeft.hours}</span>
              <span className="text-xs font-normal">h</span>
            </div>
            <div className="flex items-baseline">
              <span>{timeLeft.minutes}</span>
              <span className="text-xs font-normal">m</span>
            </div>
          </div>
        ) : (
          <p className="font-bold text-primary text-sm">Good Luck!</p>
        )}
      </div>
    );
  }

  // Detailed view for course page
  return (
    <div className="text-center font-mono">
      <p className="font-sans font-medium text-sm text-muted-foreground mb-2">Countdown to Exam</p>
      {timeLeft.days !== undefined ? (
        <div className="flex justify-center items-center gap-2 md:gap-4 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">{formatNum(timeLeft.days || 0)}</div>
            <div className="text-xs text-muted-foreground">DAYS</div>
          </div>
          <div className="text-2xl font-bold">:</div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">{formatNum(timeLeft.hours || 0)}</div>
            <div className="text-xs text-muted-foreground">HOURS</div>
          </div>
          <div className="text-2xl font-bold">:</div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">{formatNum(timeLeft.minutes || 0)}</div>
            <div className="text-xs text-muted-foreground">MINUTES</div>
          </div>
          <div className="text-2xl font-bold">:</div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">{formatNum(timeLeft.seconds || 0)}</div>
            <div className="text-xs text-muted-foreground">SECONDS</div>
          </div>
          <div className="pt-5 hidden md:block">
            <div className="text-lg font-semibold text-accent">{String(timeLeft.milliseconds || 0).padStart(3, '0')}</div>
          </div>
        </div>
      ) : (
        <p className="text-2xl font-bold text-primary">Good Luck on Your Exam!</p>
      )}
    </div>
  );
}
