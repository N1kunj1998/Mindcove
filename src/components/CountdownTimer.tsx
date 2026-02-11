import { useState, useEffect } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  // Helper function to calculate the next reset time (every 8 hours: 12 AM, 8 AM, 4 PM)
  const getNextResetTime = (): Date => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Reset times: 12:00 AM (0), 8:00 AM (8), 4:00 PM (16)
    const resetHours = [0, 8, 16];
    
    // Find the next reset hour (greater than current hour)
    const nextResetHour = resetHours.find(hour => hour > currentHour);
    
    const nextReset = new Date(now);
    
    if (nextResetHour !== undefined) {
      // Next reset is today at the found hour
      nextReset.setHours(nextResetHour, 0, 0, 0);
    } else {
      // No reset hour found today, so next reset is tomorrow at midnight (12:00 AM)
      nextReset.setDate(nextReset.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);
    }
    
    return nextReset;
  };

  // Helper function to calculate time remaining
  const calculateTimeRemaining = (): TimeLeft => {
    const now = new Date();
    const nextReset = getNextResetTime();
    const difference = nextReset.getTime() - now.getTime();
    
    if (difference <= 0) {
      // If we've passed the reset time, recalculate for the next reset
      const newNextReset = getNextResetTime();
      const newDifference = newNextReset.getTime() - now.getTime();
      
      const hours = Math.floor((newDifference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((newDifference / (1000 * 60)) % 60);
      const seconds = Math.floor((newDifference / 1000) % 60);
      
      return { hours, minutes, seconds };
    }
    
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    
    return { hours, minutes, seconds };
  };

  // Initialize state with calculated time
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeRemaining());

  useEffect(() => {
    // Update immediately to get accurate time
    setTimeLeft(calculateTimeRemaining());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <div className="bg-foreground text-background font-display text-4xl md:text-5xl px-4 py-3 rounded-lg min-w-[70px] text-center">
          {formatNumber(timeLeft.hours)}
        </div>
        <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Hours</span>
      </div>
      <span className="text-3xl font-bold text-foreground animate-pulse">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-foreground text-background font-display text-4xl md:text-5xl px-4 py-3 rounded-lg min-w-[70px] text-center">
          {formatNumber(timeLeft.minutes)}
        </div>
        <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Minutes</span>
      </div>
      <span className="text-3xl font-bold text-foreground animate-pulse">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-urgent text-urgent-foreground font-display text-4xl md:text-5xl px-4 py-3 rounded-lg min-w-[70px] text-center animate-pulse">
          {formatNumber(timeLeft.seconds)}
        </div>
        <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Seconds</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
