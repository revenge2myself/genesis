import type { Course, Progress } from './types';
import { courses } from './data/courses.ts';
import { schedule } from './types.ts';

export const STORAGE_KEY = 'gamecraft-progress-v1';
export const emptyProgress = (): Progress => ({completed:{},notes:{},artifacts:{},quizAnswers:{},checkpointChecks:{},focusSeconds:0,focusByDate:{},lastCourse:'pong',lastDay:0});
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const validDayKeys = new Set<string>(courses.flatMap(course => course.days.map((_, day) => `${course.id}:${day}`)));
const validTaskKeys = new Set<string>([...validDayKeys].flatMap(key => schedule.map(block => `${key}:${block.id}`)));
const validQuizKeys = new Map<string,number>(courses.flatMap(course => course.quiz.map((quiz,index) => [`${course.id}:${index}`,quiz.options.length] as const)));
const validCheckpointKeys = new Set<string>(courses.flatMap(course => course.checkpoint ? [
  ...course.checkpoint.rubric.map(row => `${course.id}:rubric:${row.id}`),
  ...course.checkpoint.hardGates.map((_,index) => `${course.id}:gate:${index}`),
] : []));
export function parseProgress(raw: string): Progress {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value)) throw new Error('学习记录格式不正确');
  const data = isRecord(value.progress) ? value.progress : value;
  const base = emptyProgress();
  if (!isRecord(data.completed) || !isRecord(data.notes)) throw new Error('缺少学习进度或笔记');
  for (const [key, val] of Object.entries(data.completed)) if(validTaskKeys.has(key) && typeof val==='boolean') base.completed[key] = val;
  for (const field of ['notes','artifacts'] as const) if(isRecord(data[field])) for(const [key,val] of Object.entries(data[field])) if(validDayKeys.has(key) && typeof val==='string') base[field][key]=val.slice(0,50000);
  if(isRecord(data.quizAnswers)) for(const [key,val] of Object.entries(data.quizAnswers)) if(validQuizKeys.has(key) && typeof val==='number' && Number.isInteger(val) && val>=0 && val<validQuizKeys.get(key)!) base.quizAnswers[key]=val;
  if(isRecord(data.checkpointChecks)) for(const [key,val] of Object.entries(data.checkpointChecks)) if(validCheckpointKeys.has(key) && typeof val==='boolean') base.checkpointChecks[key]=val;
  if(typeof data.focusSeconds==='number' && Number.isFinite(data.focusSeconds) && data.focusSeconds>=0) base.focusSeconds=Math.floor(data.focusSeconds);
  if(isRecord(data.focusByDate)) for(const [key,val] of Object.entries(data.focusByDate)) if(/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof val==='number' && Number.isFinite(val) && val>=0) base.focusByDate[key]=Math.floor(val);
  if(typeof data.lastCourse==='string' && courses.some(course=>course.id===data.lastCourse)) base.lastCourse=data.lastCourse;
  const lastCourse=courses.find(course=>course.id===base.lastCourse)!;
  if(typeof data.lastDay==='number' && Number.isInteger(data.lastDay) && data.lastDay>=0 && data.lastDay<lastCourse.days.length) base.lastDay=data.lastDay;
  return base;
}
export function assessCheckpoint(course: Course, checks: Record<string, boolean>) {
  const rubric = course.checkpoint?.rubric ?? [];
  const gates = course.checkpoint?.hardGates ?? [];
  const score = rubric.reduce((total, row) => total + (checks[`${course.id}:rubric:${row.id}`] ? row.points : 0), 0);
  const maxScore = rubric.reduce((total, row) => total + row.points, 0);
  const passedGates = gates.filter((_,index) => checks[`${course.id}:gate:${index}`]).length;
  const started = rubric.some(row => checks[`${course.id}:rubric:${row.id}`]) || passedGates > 0;
  return {score,maxScore,passedGates,totalGates:gates.length,started,passed:!!course.checkpoint && score>=course.checkpoint.passScore && passedGates===gates.length};
}
export function dateKey(date = new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function formatDuration(seconds:number) { const hours=Math.floor(seconds/3600); const minutes=Math.floor(seconds%3600/60); return hours ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`; }
