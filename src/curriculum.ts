import { courses } from './data/courses.ts';
import { schedule } from './types.ts';
import type { Course } from './types';

export const dailyMinutes = schedule.reduce((total, block) => total + block.minutes, 0);
export const curriculumDays = courses.reduce((total, course) => total + course.days.length, 0);
export const curriculumHours = curriculumDays * dailyMinutes / 60;
export const curriculumTasks = curriculumDays * schedule.length;
export const checkpointCourses = courses.filter(course => course.kind === 'checkpoint');
export const projectHours = (course: Course) => course.days.length * dailyMinutes / 60;
export function firstCourseDay(id: string): number {
  let day = 1;
  for (const course of courses) {
    if (course.id === id) return day;
    day += course.days.length;
  }
  return 1;
}
