import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, Code2, Copy, ExternalLink, Flag, Layers3, Lightbulb, ListChecks, NotebookPen, Play, Sparkles, X } from 'lucide-react';
import { schedule } from '../types';
import type { Course, Progress } from '../types';
import { courses } from '../data/courses';
import { assessCheckpoint } from '../progress';
import './lesson.css';

interface LessonPanelProps {
  course: Course;
  day: number;
  onDayChange: (day: number) => void;
  progress: Progress;
  onToggleTask: (key: string) => void;
  onNote: (key: string, value: string) => void;
  onArtifact: (key: string, value: string) => void;
  onQuiz: (key: string, answer: number) => void;
  onCheckpointCheck: (key: string) => void;
  onClose: () => void;
}

const tabs = [
  { id: 'practice', label: '今日实作', icon: Play },
  { id: 'compare', label: '双引擎对照', icon: Layers3 },
  { id: 'code', label: '代码参考', icon: Code2 },
  { id: 'review', label: '验收与复盘', icon: ListChecks },
] as const;
type Tab = typeof tabs[number]['id'];

export default function LessonPanel({ course, day, onDayChange, progress, onToggleTask, onNote, onArtifact, onQuiz, onCheckpointCheck, onClose }: LessonPanelProps) {
  const [tab, setTab] = useState<Tab>('practice');
  const [engine, setEngine] = useState<'cocos' | 'unity'>('cocos');
  const [copyState, setCopyState] = useState('复制代码');
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeCallback = useRef(onClose);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDay = Math.min(Math.max(day, 0), course.days.length - 1);
  const lesson = course.days[currentDay];
  const dayKey = `${course.id}:${currentDay}`;
  const completedTasks = schedule.filter(item => progress.completed[`${dayKey}:${item.id}`]).length;
  const completedMinutes = schedule.reduce((total, item) => total + (progress.completed[`${dayKey}:${item.id}`] ? item.minutes : 0), 0);
  const checkpoint = course.checkpoint;
  const assessment = assessCheckpoint(course, progress.checkpointChecks);
  const assessmentStatus = assessment.passed ? '自评达标' : assessment.started ? '需要补做' : '待验收';
  const prerequisiteTitles = (course.prerequisites ?? []).map(id => courses.find(item => item.id === id)?.title ?? id);

  useEffect(() => { closeCallback.current = onClose; }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeCallback.current(); }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(element => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) { event.preventDefault(); dialogRef.current.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => { setCopyState('复制代码'); }, [course.id, engine]);

  const copyCode = async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(course.code[engine]); copied = true; }
    } catch { /* Use the selection-based fallback when clipboard permissions are unavailable. */ }
    if (!copied) {
      const previousFocus = document.activeElement as HTMLElement | null;
      const textarea = document.createElement('textarea');
      textarea.value = course.code[engine];
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      dialogRef.current?.appendChild(textarea);
      textarea.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      textarea.remove();
      previousFocus?.focus();
    }
    setCopyState(copied ? '已复制' : '复制失败，请手动选取代码');
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('复制代码'), 3500);
  };

  const selectDay = (nextDay: number) => {
    onDayChange(nextDay);
    setTab('practice');
    dialogRef.current?.querySelector('.lesson-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return createPortal(
    <div className="lesson-overlay">
      <div className="lesson-backdrop" onClick={onClose} aria-hidden="true" />
      <section className="lesson-dialog" role="dialog" aria-modal="true" aria-labelledby="lesson-title" ref={dialogRef} tabIndex={-1}>
        <header className="lesson-header">
          <div className="lesson-header-top">
            <span className="lesson-eyebrow"><span /> 实作课堂 <ChevronRight size={13} /> 第 {String(course.number).padStart(2, '0')} 章</span>
            <button className="lesson-icon-button" ref={closeRef} onClick={onClose} aria-label="关闭实作课堂"><X size={20} /></button>
          </div>
          <div className="lesson-title-row"><h2 id="lesson-title">{course.title}</h2><span className="lesson-stage">{course.stage}</span>{checkpoint && <span className="lesson-checkpoint-badge">阶段验收</span>}</div>
          <p className="lesson-subtitle">{course.subtitle}</p>
          <nav className="lesson-days" aria-label="选择学习日">
            {course.days.map((item, index) => {
              const done = schedule.every(task => progress.completed[`${course.id}:${index}:${task.id}`]);
              return <button key={item.title} onClick={() => selectDay(index)} className={`lesson-day ${index === currentDay ? 'is-current' : ''} ${done ? 'is-done' : ''}`} aria-current={index === currentDay ? 'step' : undefined}>
                <span className="lesson-day-number">{done ? <CheckCircle2 size={14} /> : <span className="lesson-day-dot" />} 第 {index + 1} 天</span>
                <span className="lesson-day-name">{item.title}</span>
              </button>;
            })}
          </nav>
          <div className="lesson-tabs" role="tablist" aria-label="课堂内容">
            {tabs.map(({ id, label, icon: Icon }, index) => <button key={id} role="tab" id={`lesson-tab-${id}`} aria-selected={tab === id} aria-controls={`lesson-panel-${id}`} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={event => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
              else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = tabs.length - 1;
              else return;
              event.preventDefault();
              setTab(tabs[next].id);
              document.getElementById(`lesson-tab-${tabs[next].id}`)?.focus();
            }}><Icon size={16} />{label}</button>)}
          </div>
        </header>

        <div className="lesson-scroll">
          <div className="lesson-tab-content" id={`lesson-panel-${tab}`} role="tabpanel" aria-labelledby={`lesson-tab-${tab}`} tabIndex={0}>
            {tab === 'practice' && <>
              {checkpoint && <section className="lesson-checkpoint-preview" aria-label="阶段作品任务">
                <div className="lesson-checkpoint-preview-heading"><span><Flag size={16} /> 综合项目 · 独立制作</span><span className={`lesson-checkpoint-state ${assessment.passed ? 'is-passed' : ''}`}>{assessmentStatus}</span></div>
                <h3>把前面学过的知识，变成一款能反复玩的游戏</h3>
                <p>{checkpoint.brief}</p>
                {prerequisiteTitles.length > 0 && <p className="lesson-checkpoint-prerequisites"><strong>调用前面学过的能力：</strong>{prerequisiteTitles.join(' · ')}</p>}
                <p className="lesson-checkpoint-explanation">完成每日任务后，还要交付可运行作品、测试记录和玩法证据。阶段评分独立保存；按实际作品勾选，阅读教程不会自动通过验收。</p>
                <button className="lesson-inline-link" onClick={() => setTab('review')}>打开阶段验收 <ArrowRight size={16} /></button>
              </section>}
              {course.kind === 'ai-art' && <div className="lesson-ai-art-intro"><Sparkles size={19} /><div><strong>从零美术基础开始，用 AI 制作可用的游戏资源</strong><p>先用简单形状验证玩法，再完成风格约束、资源生成、透明处理和双引擎导入。每份资源都要在实际游戏中检查辨识度、动画和性能，并保存来源与使用许可。</p></div></div>}
              <div className="lesson-goal">
                <div className="lesson-goal-label"><Flag size={16} /> 第 {currentDay + 1} 天 · 今天要完成什么</div>
                <h3>{lesson.goal}</h3>
                <p>{lesson.concept}</p>
                <div className="lesson-goal-meta"><span><Clock3 size={14} /> 330 分钟专注实作</span><span><Layers3 size={14} /> 两个引擎，同一个游戏</span></div>
              </div>

              <div className="lesson-section-heading"><div><span className="lesson-section-kicker">从理解到可玩</span><h3>今天的制作路线</h3></div><span className="lesson-soft-label">边做边学</span></div>
              <ol className="lesson-steps">{lesson.steps.map((step, index) => <li key={step}><span className="lesson-step-number">{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
              <div className="lesson-engine-grid">
                <article className="lesson-engine-card is-cocos"><span className="lesson-engine-brand"><Code2 size={17} /> Cocos Creator</span><h4>移动端实现</h4><p>{lesson.cocos}</p></article>
                <article className="lesson-engine-card is-unity"><span className="lesson-engine-brand"><Layers3 size={17} /> Unity</span><h4>桌面与主机思路</h4><p>{lesson.unity}</p></article>
              </div>

              <div className="lesson-section-heading"><div><span className="lesson-section-kicker">留出时间，真的做出来</span><h3>5.5 小时学习安排</h3></div><span className="lesson-completion">{completedTasks} / {schedule.length} 已完成</span></div>
              <div className="lesson-schedule">
                {schedule.map(item => {
                  const checked = !!progress.completed[`${dayKey}:${item.id}`];
                  return <label key={item.id} className={`lesson-schedule-item ${checked ? 'is-complete' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => onToggleTask(`${dayKey}:${item.id}`)} />
                    <span className="lesson-task-check" aria-hidden="true">{checked && <Check size={14} strokeWidth={3} />}</span>
                    <span className="lesson-task-time">{item.time}</span>
                    <span className="lesson-task-copy"><strong>{item.title}</strong><span>{item.desc}</span></span>
                    <span className="lesson-task-duration">{item.minutes} <small>分钟</small></span>
                  </label>;
                })}
              </div>
              <p className="lesson-hint"><Lightbulb size={14} /> 时段可以调整；总计 330 分钟，不含休息。勾选只记录自评进度，不代表引擎运行或作品验收通过。已勾选任务对应 {completedMinutes} 分钟。</p>
              <button className="lesson-inline-link" onClick={() => setTab('review')}>做完了？检查今天的作品 <ArrowRight size={16} /></button>
            </>}

            {tab === 'compare' && <>
              <div className="lesson-section-heading lesson-first-heading"><div><span className="lesson-section-kicker">理解一次，迁移两次</span><h3>相同的游戏逻辑，不同的引擎表达</h3></div></div>
              <p className="lesson-intro">先理解共同原理，再查阅各引擎的实现。关键术语保留中英文，方便查文档与定位编辑器功能。</p>
              <div className="lesson-comparison-list">
                {course.concepts.map(concept => <article className="lesson-concept-card" key={concept.en}>
                  <div className="lesson-concept-heading"><h4>{concept.zh}</h4><span>{concept.en}</span></div>
                  <p className="lesson-shared"><span>共同原理</span>{concept.same}</p>
                  <div className="lesson-concept-engines"><div><span className="lesson-mini-brand is-cocos">Cocos Creator</span><p>{concept.cocos}</p></div><div><span className="lesson-mini-brand is-unity">Unity</span><p>{concept.unity}</p></div></div>
                </article>)}
              </div>
              <div className="lesson-callout"><Lightbulb size={18} /><div><strong>试着讲给另一个人听</strong><p>不用代码复述共同原理，再分别指出两个引擎里负责这件事的组件、回调或编辑器设置。能解释差异，才更容易独立迁移。</p></div></div>
            </>}

            {tab === 'code' && <>
              <div className="lesson-section-heading lesson-first-heading"><div><span className="lesson-section-kicker">先理解，再改写</span><h3>{course.code.title}</h3></div></div>
              <p className="lesson-intro">{course.code.context}</p>
              <div className="lesson-code-box">
                <div className="lesson-code-toolbar"><div className="lesson-code-engines" role="group" aria-label="参考代码引擎"><button aria-pressed={engine === 'cocos'} onClick={() => setEngine('cocos')}>Cocos · TypeScript</button><button aria-pressed={engine === 'unity'} onClick={() => setEngine('unity')}>Unity · C#</button></div><button className="lesson-copy" onClick={copyCode}>{copyState === '已复制' ? <Check size={14} /> : <Copy size={14} />}<span aria-live="polite">{copyState}</span></button></div>
                <pre tabIndex={0} aria-label={`${engine === 'cocos' ? 'Cocos TypeScript' : 'Unity C#'} 参考代码`}><code>{course.code[engine]}</code></pre>
              </div>
              <div className="lesson-callout"><Code2 size={18} /><div><strong>让参考代码变成你的能力</strong><p>按上方说明创建脚本、挂载组件并完成编辑器绑定。先运行最小版本，再关闭参考独立重写；代码片段需要与本章场景、资源和输入设置配合。</p></div></div>
              <div className="lesson-section-heading"><div><h3>常见问题与避坑</h3></div></div>
              <ul className="lesson-pitfalls">{course.pitfalls.map(pitfall => <li key={pitfall}><Lightbulb size={16} /><span>{pitfall}</span></li>)}</ul>
            </>}

            {tab === 'review' && <>
              {checkpoint && <section className="lesson-checkpoint-assessment" aria-labelledby="checkpoint-title">
                <div className="lesson-section-heading lesson-first-heading"><div><span className="lesson-section-kicker">阶段验收 · 按作品证据打分</span><h3 id="checkpoint-title">这一次，交付完整的可玩体验</h3></div><span className={`lesson-checkpoint-state ${assessment.passed ? 'is-passed' : ''}`} role="status">{assessmentStatus}</span></div>
                <p className="lesson-checkpoint-reference"><strong>玩法参考：</strong>{checkpoint.reference}</p>
                <p className="lesson-checkpoint-brief">{checkpoint.brief}</p>
                {prerequisiteTitles.length > 0 && <p className="lesson-checkpoint-prerequisites"><strong>回看先修章节：</strong>{prerequisiteTitles.join(' · ')}</p>}
                <div className="lesson-checkpoint-requirements"><h4>作品必须做到</h4><ul>{checkpoint.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}</ul></div>

                <div className={`lesson-checkpoint-score ${assessment.passed ? 'is-passed' : ''}`} aria-live="polite">
                  <div><span>作品自评得分</span><strong>{assessment.score}<small> / {assessment.maxScore}</small></strong></div>
                  <p>至少 {checkpoint.passScore} 分，并满足全部 {assessment.totalGates} 项必过条件。<br />已满足必过条件 {assessment.passedGates} / {assessment.totalGates} 项。</p>
                </div>
                <fieldset className="lesson-checkpoint-checklist"><legend>评分标准（Rubric）</legend><p className="lesson-checkpoint-explanation">先运行两个引擎的作品，按证据逐项检查；只有完整达到该项要求，才勾选获得分数。</p>
                  {checkpoint.rubric.map(criterion => {
                    const key = `${course.id}:rubric:${criterion.id}`;
                    const checked = !!progress.checkpointChecks[key];
                    return <label key={key} className={`lesson-checkpoint-criterion ${checked ? 'is-checked' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => onCheckpointCheck(key)} />
                      <span className="lesson-checkpoint-criterion-copy"><strong>{criterion.label}</strong><span>验收证据：{criterion.evidence}</span></span><span className="lesson-checkpoint-points">{criterion.points} 分</span>
                    </label>;
                  })}
                </fieldset>
                <fieldset className="lesson-checkpoint-checklist lesson-checkpoint-gates"><legend>必过条件（Hard Gates）· 缺一项都需补做</legend>
                  {checkpoint.hardGates.map((gate, index) => {
                    const key = `${course.id}:gate:${index}`;
                    const checked = !!progress.checkpointChecks[key];
                    return <label key={key} className={`lesson-checkpoint-criterion ${checked ? 'is-checked' : ''}`}><input type="checkbox" checked={checked} onChange={() => onCheckpointCheck(key)} /><span className="lesson-checkpoint-criterion-copy"><strong>{gate}</strong></span><span className="lesson-checkpoint-gate-tag">必过</span></label>;
                  })}
                </fieldset>
                <p className={`lesson-checkpoint-result ${assessment.passed ? 'is-passed' : ''}`} role="status">{assessment.passed ? '自评达标，仍需按证据复核。邀请他人盲测，再根据反馈修改作品。' : assessment.started ? '需要补做：补齐未勾选的评分项与必过条件，再运行作品复测。' : '待验收：先完成可运行作品，再记录证据与自评。'} 这里记录的是你的自评，不会自动检查游戏或替代真实试玩。</p>
                {checkpoint.stretch.length > 0 && <div className="lesson-checkpoint-stretch"><h4><Sparkles size={15} /> 达标后再挑战</h4><ul>{checkpoint.stretch.map(item => <li key={item}>{item}</li>)}</ul></div>}
                <p className="lesson-field-help">评分与必过条件自动保存在此浏览器，包含在学习备份中。请在下方作品记录与复盘中保存演示链接、版本号和测试证据。</p>
              </section>}
              <div className="lesson-section-heading lesson-first-heading"><div><span className="lesson-section-kicker">把“看懂了”变成“做到了”</span><h3>第 {currentDay + 1} 天的验收标准</h3></div><span className="lesson-soft-label">手动验证</span></div>
              <ul className="lesson-acceptance">{lesson.acceptance.map(item => <li key={item}><CheckCircle2 size={18} /><span>{item}</span></li>)}</ul>
              <div className="lesson-deliverables"><h4><ArrowDownToLine size={17} /> 本章最终交付物</h4><ul>{course.deliverables.map(item => <li key={item}>{item}</li>)}</ul></div>
              <label className="lesson-field-label" htmlFor="lesson-artifact">今天的作品记录 <span>自动保存在此浏览器</span></label>
              <input id="lesson-artifact" className="lesson-artifact-input" type="text" value={progress.artifacts[dayKey] ?? ''} onChange={event => onArtifact(dayKey, event.target.value)} placeholder="记录作品链接、Git 提交编号或本地项目路径…" />
              <p className="lesson-field-help">这里只保存文本记录，不会上传文件，也不会自动验证作品内容。</p>

              <div className="lesson-section-heading"><div><span className="lesson-section-kicker">检验是否真正理解</span><h3>本章知识自测</h3></div><span className="lesson-soft-label">可以反复练习</span></div>
              <div className="lesson-quizzes">{course.quiz.map((quiz, index) => {
                const key = `${course.id}:${index}`;
                const answer = progress.quizAnswers[key];
                const answered = typeof answer === 'number';
                const correct = answer === quiz.answer;
                return <fieldset key={key} className="lesson-quiz"><legend><span>{String(index + 1).padStart(2, '0')}</span>{quiz.question}</legend><div className="lesson-quiz-options">{quiz.options.map((option, optionIndex) => <label key={option} className={answer === optionIndex ? 'is-selected' : ''}><input type="radio" name={`quiz-${key}`} checked={answer === optionIndex} onChange={() => onQuiz(key, optionIndex)} /><span>{option}</span></label>)}</div>{answered && <div className={`lesson-quiz-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status"><strong>{correct ? '回答正确' : '再想一想'}{correct ? '，继续保持。' : `。正确答案：${quiz.options[quiz.answer]}`}</strong><p>{quiz.explanation}</p></div>}</fieldset>;
              })}</div>

              <div className="lesson-section-heading"><div><span className="lesson-section-kicker">留下自己的思考</span><h3>今日复盘</h3></div><NotebookPen size={20} /></div>
              <p className="lesson-reflection-prompt">{lesson.reflection}</p>
              <label className="lesson-sr-only" htmlFor="lesson-notes">今日复盘笔记</label>
              <textarea id="lesson-notes" className="lesson-notes" value={progress.notes[dayKey] ?? ''} onChange={event => onNote(dayKey, event.target.value)} placeholder={'今天我独立完成了什么？\n两个引擎的实现差异是什么？\n遇到了什么问题，如何验证并解决？\n明天的第一步是什么？'} rows={7} />
              <p className="lesson-field-help"><Check size={13} /> 输入时自动保存到此浏览器；清理浏览器数据会删除记录，请定期使用主页面的导出功能备份。</p>
            </>}
          </div>

          <aside className="lesson-resources" aria-labelledby="lesson-resources-title"><div className="lesson-section-heading"><div><h3 id="lesson-resources-title"><BookOpen size={17} /> 延伸阅读与官方文档</h3></div><span className="lesson-soft-label">按需查阅</span></div><div className="lesson-resource-grid">{course.resources.map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer"><span><strong>{resource.label}</strong><small>{resource.note}</small></span><ExternalLink size={15} /></a>)}</div></aside>
          <div className="lesson-bottom-note"><Sparkles size={14} /> 每一章都留下一个能玩的作品，每一天都更接近独立开发。</div>
        </div>

        <footer className="lesson-footer"><button className="lesson-previous" onClick={() => selectDay(currentDay - 1)} disabled={currentDay === 0}><ArrowLeft size={16} /> 前一天</button><span>第 <strong>{currentDay + 1}</strong> / {course.days.length} 天 <span className="lesson-footer-separator">·</span> {completedTasks} 项已记录</span>{currentDay < course.days.length - 1 ? <button className="lesson-next" onClick={() => selectDay(currentDay + 1)}>继续下一天 <ArrowRight size={16} /></button> : <button className="lesson-next" onClick={onClose}>返回学习路径 <Check size={16} /></button>}</footer>
      </section>
    </div>, document.body,
  );
}
