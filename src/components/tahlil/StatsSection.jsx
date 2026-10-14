import React from "react";
import DashboardStats from "./DashboardStats.jsx";
import WorkoutCalendar from "./WorkoutCalendar.jsx";
import WorkoutDayModal from "./WorkoutDayModal.jsx";

export default function StatsSection({ stats, prCount, calendar }) {
  return (
    <div>
      <DashboardStats stats={stats} prCount={prCount} />

      <WorkoutCalendar
        label={calendar.label}
        weeks={calendar.weeks}
        byDate={calendar.byDate}
        today={calendar.today}
        monthStats={calendar.monthStats}
        onPrev={calendar.prevMonth}
        onNext={calendar.nextMonth}
        onSelect={calendar.selectDate}
      />

      <WorkoutDayModal
        date={calendar.selectedDate}
        workouts={calendar.selectedWorkouts}
        onClose={calendar.clearSelection}
      />
    </div>
  );
}
