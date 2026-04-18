const MINUTES_IN_HOUR = 60;
const LABOR_DAY_MONTH = 8;

function parseTimeToMinutes(time) {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * MINUTES_IN_HOUR + minutes;
}

function getFirstMondayInSeptember(year) {
  const date = new Date(year, 8, 1);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function isBetweenJuneAndLaborDay(date) {
  const current = new Date(date);
  const laborDay = getFirstMondayInSeptember(current.getFullYear());
  const juneFirst = new Date(current.getFullYear(), 5, 1);
  return current >= juneFirst && current < laborDay;
}

function normalizeTaskCategory(task) {
  return task?.category || task?.categoryId || '';
}

export function filterTasksByAge(tasks, teenAge, currentDateTime = new Date()) {
  if (!Array.isArray(tasks)) return [];
  if (!teenAge || teenAge >= 16) {
    return tasks.filter((task) => task?.status === 'open');
  }

  const currentMinutes = currentDateTime.getHours() * MINUTES_IN_HOUR + currentDateTime.getMinutes();
  const latestAllowed = isBetweenJuneAndLaborDay(currentDateTime) ? 21 * MINUTES_IN_HOUR : 19 * MINUTES_IN_HOUR;

  return tasks.filter((task) => {
    if (!task || task.status !== 'open') return false;

    const category = normalizeTaskCategory(task);
    if (category === 'yard_power' || category === 'moving_help' || task.requiresPowerTools) {
      return false;
    }

    const startMinutes = parseTimeToMinutes(task.startTime);
    const isTimeAllowed = startMinutes >= 7 * MINUTES_IN_HOUR && startMinutes <= latestAllowed;

    return isTimeAllowed && currentMinutes >= 0;
  });
}

export { parseTimeToMinutes, getFirstMondayInSeptember, isBetweenJuneAndLaborDay };
