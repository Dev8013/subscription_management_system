
import React, { useState, useEffect } from 'react';

interface Props {
  endDate: string;
}

const CountdownTimer: React.FC<Props> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return <span className="text-rose-500 font-bold uppercase tracking-tighter text-xs">Expired</span>;

  return (
    <div className="flex space-x-2 text-xs font-mono tabular-nums">
      <div className="flex flex-col items-center">
        <span className="text-slate-900 font-bold">{timeLeft.days}d</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-slate-900 font-bold">{timeLeft.hours}h</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-slate-900 font-bold">{timeLeft.minutes}m</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-slate-900 font-bold">{timeLeft.seconds}s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
