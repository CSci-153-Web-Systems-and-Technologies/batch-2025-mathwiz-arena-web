"use client";

import { useState } from "react";

interface Competition {
  id: string;
  name: string;
  start_datetime: string;
}

interface CompetitionCalendarProps {
  competitions: Competition[];
}

export default function CompetitionCalendar({ competitions }: CompetitionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Create a set of competition dates for this month
  const competitionDates = new Set<string>();
  const competitionsByDate = new Map<string, Competition[]>();
  
  competitions.forEach(comp => {
    const compDate = new Date(comp.start_datetime);
    if (compDate.getMonth() === month && compDate.getFullYear() === year) {
      const dateKey = compDate.getDate().toString();
      competitionDates.add(dateKey);
      
      if (!competitionsByDate.has(dateKey)) {
        competitionsByDate.set(dateKey, []);
      }
      competitionsByDate.get(dateKey)?.push(comp);
    }
  });
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = isCurrentMonth ? today.getDate() : null;
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-8"></div>);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = day.toString();
    const hasCompetition = competitionDates.has(dateKey);
    const isToday = day === todayDate;
    const competitions = competitionsByDate.get(dateKey) || [];
    
    calendarDays.push(
      <div
        key={day}
        className={`h-8 flex items-center justify-center text-sm rounded-lg relative group cursor-pointer
          ${isToday && hasCompetition ? "bg-purple-100 text-purple-700 font-bold" : ""}
          ${isToday && !hasCompetition ? "bg-blue-100 text-blue-700 font-bold" : ""}
          ${hasCompetition && !isToday ? "bg-red-100 text-red-700 font-semibold" : ""}
          ${!hasCompetition && !isToday ? "text-slate-700 hover:bg-slate-100" : ""}
        `}
        title={hasCompetition ? competitions.map(c => c.name).join(", ") : ""}
      >
        {day}
        {hasCompetition && (
          <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
            isToday ? "bg-purple-600" : "bg-red-600"
          }`}></div>
        )}
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[#25346A] uppercase tracking-wide">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Previous month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#25346A] min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Next month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
          <div key={day} className="h-6 flex items-center justify-center text-xs font-semibold text-slate-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>
      
      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
          <span className="text-slate-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
          <span className="text-slate-600">Competition</span>
        </div>
      </div>
    </div>
  );
}
