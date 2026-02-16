import { useState, useEffect } from 'react';
import { getDay, today } from '../store';

const GOAL_MIN = 30;

export function DailyScore() {
  const [silentMin, setSilentMin] = useState(0);

  useEffect(() => {
    const update = () => {
      const day = getDay(today());
      setSilentMin(Math.round(day.totalSilentMs / 60000));
    };
    update();
    const id = setInterval(update, 3000);
    return () => clearInterval(id);
  }, []);

  const pct = Math.min(silentMin / GOAL_MIN, 1);
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);

  return (
    <section className="text-center space-y-4">
      <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">Today's Silence</h2>
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#F0F0F0" strokeWidth="4" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#C5A55A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extralight">{silentMin}</span>
          <span className="text-[9px] text-neutral-400">/ {GOAL_MIN} min</span>
        </div>
      </div>
    </section>
  );
}
