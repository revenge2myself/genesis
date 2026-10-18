import test from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../src/data/courses.ts';
import { schedule } from '../src/types.ts';
import { emptyProgress, parseProgress, dateKey } from '../src/progress.ts';

test('12 项目覆盖 72 个实作日，每天净学习 330 分钟', () => {
  assert.equal(courses.length, 12);
  assert.equal(new Set(courses.map(c => c.id)).size, 12);
  assert.equal(courses.reduce((sum,c)=>sum+c.days.length,0), 72);
  assert.equal(schedule.reduce((sum,s)=>sum+s.minutes,0), 330);
  assert.deepEqual(courses.map(c=>c.number),Array.from({length:12},(_,i)=>i+1));
  for(const c of courses) {
    assert.equal(c.days.length,6,c.id);
    for(const d of c.days) {
      assert.ok(d.goal.length>8 && d.concept.length>30, `${c.id} ${d.title} 有实质目标与概念解释`);
      assert.ok(d.steps.length>=3, `${c.id} ${d.title} 有具体动手步骤`);
      assert.ok(d.cocos.length>20 && d.unity.length>20, `${c.id} ${d.title} 有双引擎指导`);
      assert.ok(d.acceptance.length>=2, `${c.id} ${d.title} 有验收标准`);
    }
    assert.ok(c.concepts.every(t=>t.zh && t.en && t.same && t.cocos && t.unity));
    assert.ok(c.code.cocos.includes("from 'cc'") && c.code.unity.includes('UnityEngine'),c.id);
    assert.ok(c.quiz.length>=2 && c.quiz.every(q=>q.answer>=0&&q.answer<q.options.length&&q.explanation.length>10));
    assert.ok(c.resources.every(r=>new URL(r.url).protocol==='https:'));
  }
});

test('学习记录可往返导出，保留笔记、正确率来源和时长',()=>{
  const p=emptyProgress();p.completed['pong:0:theory']=true;p.notes['pong:0']='测试世界坐标与界面坐标';p.artifacts['pong:0']='本地录像路径';p.quizAnswers['pong:0']=1;p.focusSeconds=421;p.focusByDate['2026-10-18']=421;p.lastCourse='bird';p.lastDay=2;
  assert.deepEqual(parseProgress(JSON.stringify({version:1,progress:p})),p);
});

test('导入拒绝错误结构并忽略无效键、越界数值和多余数据',()=>{
  assert.throws(()=>parseProgress('not JSON'));
  assert.throws(()=>parseProgress('{}'));
  assert.throws(()=>parseProgress('[]'));
  const p=parseProgress(JSON.stringify({completed:{'pong:0:theory':true,'pong:99:fake':true},notes:{'pong:0':44},focusSeconds:-5,lastCourse:'unknown',lastDay:50,quizAnswers:{'pong:0':-1}}));
  assert.deepEqual(p.completed,{'pong:0:theory':true});
  assert.deepEqual(p.notes,{});assert.equal(p.focusSeconds,0);assert.equal(p.lastCourse,'pong');assert.equal(p.lastDay,0);
  assert.deepEqual(p.quizAnswers,{});
});

test('学习日期使用上海时区，跨 UTC 零点正确归档',()=>{
  assert.equal(dateKey(new Date('2026-10-17T16:30:00Z')),'2026-10-18');
  assert.equal(dateKey(new Date('2026-10-17T15:30:00Z')),'2026-10-17');
});
