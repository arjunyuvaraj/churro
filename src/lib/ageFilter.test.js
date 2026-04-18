import { describe, expect, it } from 'vitest';
import { filterTasksByAge } from './ageFilter';

const tasks = [
  { id: '1', status: 'open', category: 'grocery_run', startTime: '08:00' },
  { id: '2', status: 'open', category: 'yard_power', requiresPowerTools: true, startTime: '08:00' },
  { id: '3', status: 'open', category: 'moving_help', startTime: '08:00' },
  { id: '4', status: 'open', category: 'grocery_run', startTime: '20:00' },
  { id: '5', status: 'open', category: 'grocery_run', startTime: '18:00' }
];

describe('filterTasksByAge', () => {
  it('removes power tools and late tasks for ages 13 to 15', () => {
    const result = filterTasksByAge(tasks, 15, new Date('2026-04-18T12:00:00'));
    expect(result.map((task) => task.id)).toEqual(['1', '5']);
  });

  it('allows all open tasks for ages 16 and 17', () => {
    const result = filterTasksByAge(tasks, 16, new Date('2026-04-18T12:00:00'));
    expect(result.map((task) => task.id)).toEqual(['1', '2', '3', '4', '5']);
  });
});
