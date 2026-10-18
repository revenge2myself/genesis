import type { Progress } from './types';

export const STORAGE_KEY = 'gamecraft-progress-v1';
export const emptyProgress = (): Progress => ({completed:{},notes:{},artifacts:{},quizAnswers:{},focusSeconds:0,focusByDate:{},lastCourse:'pong',lastDay:0});
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function parseProgress(raw: string): Progress {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value)) throw new Error('学习记录格式不正确');
  const data = isRecord(value.progress) ? value.progress : value;
  const base = emptyProgress();
  const validKeys = /^(pong|bird|breakout|runner|puzzle|tower|farm|dungeon|survival|ads|steam|switch):[0-5]:(theory|cocos|unity|challenge|review)$/;
  if (!isRecord(data.completed) || !isRecord(data.notes)) throw new Error('缺少学习进度或笔记');
  for (const [key, val] of Object.entries(data.completed)) if(validKeys.test(key) && typeof val==='boolean') base.completed[key] = val;
  for (const field of ['notes','artifacts'] as const) if(isRecord(data[field])) for(const [key,val] of Object.entries(data[field])) if(/^[a-z]+:[0-5]$/.test(key) && typeof val==='string') base[field][key]=val.slice(0,50000);
  if(isRecord(data.quizAnswers)) for(const [key,val] of Object.entries(data.quizAnswers)) if(/^[a-z]+:\d+$/.test(key) && typeof val==='number' && Number.isInteger(val) && val>=0 && val<10) base.quizAnswers[key]=val;
  if(typeof data.focusSeconds==='number' && Number.isFinite(data.focusSeconds) && data.focusSeconds>=0) base.focusSeconds=Math.floor(data.focusSeconds);
  if(isRecord(data.focusByDate)) for(const [key,val] of Object.entries(data.focusByDate)) if(/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof val==='number' && Number.isFinite(val) && val>=0) base.focusByDate[key]=Math.floor(val);
  if(typeof data.lastCourse==='string' && /^(pong|bird|breakout|runner|puzzle|tower|farm|dungeon|survival|ads|steam|switch)$/.test(data.lastCourse)) base.lastCourse=data.lastCourse;
  if(typeof data.lastDay==='number' && Number.isInteger(data.lastDay) && data.lastDay>=0 && data.lastDay<6) base.lastDay=data.lastDay;
  return base;
}
export function dateKey(date = new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function formatDuration(seconds:number) { const hours=Math.floor(seconds/3600); const minutes=Math.floor(seconds%3600/60); return hours ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`; }
