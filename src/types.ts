export type Stage = '基础入门' | '核心玩法' | '完整游戏' | '商业实战';
export interface LessonDay {
  title: string;
  goal: string;
  concept: string;
  steps: string[];
  cocos: string;
  unity: string;
  acceptance: string[];
  reflection: string;
}
export interface Course {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  stage: Stage;
  theme: 'mint' | 'lavender' | 'peach' | 'blue';
  art: 'pong' | 'bird' | 'breakout' | 'runner' | 'puzzle' | 'tower' | 'farm' | 'dungeon' | 'survival' | 'ads' | 'steam' | 'switch' | 'aiart' | 'arcadecheck' | 'strategycheck' | 'survivalcheck' | 'releasecheck';
  kind?: 'project' | 'ai-art' | 'checkpoint';
  prerequisites?: string[];
  checkpoint?: {
    reference: string;
    brief: string;
    requirements: string[];
    rubric: { id: string; label: string; points: number; evidence: string }[];
    passScore: number;
    hardGates: string[];
    stretch: string[];
  };
  tags: string[];
  concepts: { zh: string; en: string; same: string; cocos: string; unity: string }[];
  days: LessonDay[];
  code: { title: string; context: string; cocos: string; unity: string };
  deliverables: string[];
  pitfalls: string[];
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
  resources: { label: string; url: string; note: string }[];
}
export interface Progress {
  completed: Record<string, boolean>;
  notes: Record<string, string>;
  artifacts: Record<string, string>;
  quizAnswers: Record<string, number>;
  checkpointChecks: Record<string, boolean>;
  focusSeconds: number;
  focusByDate: Record<string, number>;
  lastCourse: string;
  lastDay: number;
}
export const schedule = [
  { id: 'theory', time: '09:00', minutes: 45, title: '理解今天的核心概念', desc: '阅读原理、画出对象与数据关系', icon: 'book' },
  { id: 'cocos', time: '09:55', minutes: 90, title: 'Cocos Creator 动手实现', desc: '完成移动端交互与一个可玩版本', icon: 'code' },
  { id: 'unity', time: '11:40', minutes: 90, title: 'Unity 对照实现', desc: '用相同验收标准重建核心玩法', icon: 'layers' },
  { id: 'challenge', time: '14:00', minutes: 75, title: '独立挑战与测试', desc: '脱离教程增加机制，验证边界情况', icon: 'zap' },
  { id: 'review', time: '15:30', minutes: 30, title: '复盘与作品归档', desc: '记录差异、提交代码与运行截图', icon: 'pen' },
] as const;
