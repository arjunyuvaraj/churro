import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TaskCalendar - Monthly calendar view for neighbor task scheduling
 * Shows task counts per day with clickable dates
 */
export default function TaskCalendar({ tasks = [], onDateSelect = () => {} }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get all dates for current month
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0).getDate();

    const dates = [];

    // Previous month's dates (grayed out)
    for (let i = firstDay.getDay() - 1; i >= 0; i -= 1) {
      dates.push({ date: prevLastDay - i, month: 'prev', fullDate: new Date(year, month - 1, prevLastDay - i) });
    }

    // Current month's dates
    for (let i = 1; i <= lastDay.getDate(); i += 1) {
      dates.push({ date: i, month: 'current', fullDate: new Date(year, month, i) });
    }

    // Next month's dates (grayed out)
    const remaining = 42 - dates.length; // 6 weeks × 7 days
    for (let i = 1; i <= remaining; i += 1) {
      dates.push({ date: i, month: 'next', fullDate: new Date(year, month + 1, i) });
    }

    return dates;
  }, [currentDate]);

  // Count tasks per date
  const tasksByDate = useMemo(() => {
    const counts = {};
    tasks.forEach((task) => {
      const dateStr = task.date || '';
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  function goToPreviousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function handleDateClick(fullDate) {
    const dateStr = fullDate.toISOString().split('T')[0];
    onDateSelect(dateStr);
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">{monthName}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg border border-border p-2 hover:bg-surface"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg border border-border p-2 hover:bg-surface"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthDates.map((dayObj, index) => {
          const dateStr = dayObj.fullDate.toISOString().split('T')[0];
          const taskCount = tasksByDate[dateStr] || 0;
          const isCurrentMonth = dayObj.month === 'current';
          const isToday = dayObj.fullDate.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(dayObj.fullDate)}
              className={`relative rounded-lg p-3 text-center transition aspect-square flex flex-col items-center justify-center text-sm font-medium ${
                isCurrentMonth
                  ? 'border border-border bg-white hover:border-primary cursor-pointer'
                  : 'text-text-secondary bg-surface'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
            >
              <span>{dayObj.date}</span>
              {taskCount > 0 && isCurrentMonth && (
                <span className="absolute bottom-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white font-bold">
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
