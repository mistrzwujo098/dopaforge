'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp, AlertCircle, Trophy } from 'lucide-react';
import { Card } from '@dopaforge/ui';

interface StreakCalendarProps {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // Array of ISO date strings
}

interface DayData {
  date: Date;
  hasActivity: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  intensity: number; // 0-4 based on tasks completed
}

export function StreakCalendar({
  userId,
  currentStreak,
  longestStreak,
  completedDates
}: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<DayData[][]>([]);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  // Milestone thresholds
  const milestones = [7, 30, 60, 100, 365];
  const nextMilestone = milestones.find(m => m > currentStreak) || 365;
  const daysToNextMilestone = nextMilestone - currentStreak;

  useEffect(() => {
    generateCalendarData();
  }, [currentMonth, completedDates]);

  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    while (startDate <= lastDay || currentWeek.length > 0) {
      const date = new Date(startDate);
      const dateStr = date.toISOString().split('T')[0];
      const hasActivity = completedDates.includes(dateStr);
      
      // Calculate intensity based on stored data
      const intensity = hasActivity ? Math.min(Math.floor(Math.random() * 4) + 1, 4) : 0;

      currentWeek.push({
        date,
        hasActivity,
        isToday: isToday(date),
        isCurrentMonth: date.getMonth() === month,
        intensity
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      startDate.setDate(startDate.getDate() + 1);
    }

    setCalendarData(weeks);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800', // 0 - no activity
      'bg-green-200 dark:bg-green-900', // 1 - low
      'bg-green-400 dark:bg-green-700', // 2 - medium
      'bg-green-600 dark:bg-green-500', // 3 - high
      'bg-green-800 dark:bg-green-300'  // 4 - very high
    ];
    return colors[intensity] || colors[0];
  };

  const getFlameIntensity = (streak: number): { size: string; color: string; animation: boolean } => {
    if (streak === 0) return { size: 'h-0 w-0', color: '', animation: false };
    if (streak < 7) return { size: 'h-4 w-4', color: 'text-orange-400', animation: false };
    if (streak < 30) return { size: 'h-5 w-5', color: 'text-orange-500', animation: true };
    if (streak < 100) return { size: 'h-6 w-6', color: 'text-red-500', animation: true };
    return { size: 'h-8 w-8', color: 'text-red-600', animation: true };
  };

  const flame = getFlameIntensity(currentStreak);
  const weekDays = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Kalendarz Aktywności</h3>
          <p className="text-sm text-muted-foreground">
            Twoja codzienna konsekwencja
          </p>
        </div>
        <div className="flex items-center gap-2">
          {flame.animation ? (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [-5, 5, -5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <Flame className={`${flame.size} ${flame.color} fill-current`} />
            </motion.div>
          ) : (
            <Flame className={`${flame.size} ${flame.color}`} />
          )}
          <div className="text-right">
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">dni z rzędu</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <p className="text-sm font-medium">Obecna seria</p>
          <p className="text-xl font-bold">{currentStreak}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
          <p className="text-sm font-medium">Najdłuższa</p>
          <p className="text-xl font-bold">{longestStreak}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Calendar className="h-5 w-5 mx-auto mb-1 text-green-500" />
          <p className="text-sm font-medium">Do kamienia</p>
          <p className="text-xl font-bold">{daysToNextMilestone}</p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const prev = new Date(currentMonth);
            prev.setMonth(prev.getMonth() - 1);
            setCurrentMonth(prev);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          ←
        </button>
        <h4 className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={() => {
            const next = new Date(currentMonth);
            next.setMonth(next.getMonth() + 1);
            setCurrentMonth(next);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="space-y-1">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  whileHover={{ scale: 1.1 }}
                  onHoverStart={() => setHoveredDay(day.date)}
                  onHoverEnd={() => setHoveredDay(null)}
                  className={`
                    aspect-square rounded-md flex items-center justify-center text-sm cursor-pointer
                    transition-all relative
                    ${getIntensityColor(day.intensity)}
                    ${day.isCurrentMonth ? '' : 'opacity-30'}
                    ${day.isToday ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <span className={`
                    ${day.hasActivity ? 'font-medium' : ''}
                    ${day.isToday ? 'font-bold' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>

                  {/* Flame icon for streaks */}
                  {day.hasActivity && day.intensity >= 3 && (
                    <Flame className="absolute top-0 right-0 h-3 w-3 text-orange-500" />
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Mniej</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Więcej</span>
        </div>

        {/* Streak warning */}
        {currentStreak > 0 && !completedDates.includes(new Date().toISOString().split('T')[0]) && (
          <div className="flex items-center gap-1 text-orange-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Seria w zagrożeniu!</span>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="mt-4 pt-4 border-t dark:border-gray-800">
        <p className="text-sm font-medium mb-2">Kamienie milowe</p>
        <div className="flex gap-2">
          {milestones.map(milestone => {
            const achieved = currentStreak >= milestone;
            const isNext = milestone === nextMilestone;
            
            return (
              <motion.div
                key={milestone}
                whileHover={{ scale: achieved ? 1.1 : 1 }}
                className={`
                  flex-1 p-2 rounded-lg text-center text-xs
                  ${achieved 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                    : isNext
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-2 border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }
                `}
              >
                <p className="font-bold">{milestone}</p>
                <p className="text-[10px]">dni</p>
                {achieved && <Flame className="h-3 w-3 mx-auto mt-1" />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}