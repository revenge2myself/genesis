import test from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../src/data/courses.ts';
import { schedule } from '../src/types.ts';
import { emptyProgress, parseProgress, dateKey, assessCheckpoint } from '../src/progress.ts';
import { curriculumDays, curriculumHours, curriculumTasks } from '../src/curriculum.ts';

test('17 项目覆盖 102 个实作日、561 小时和 510 项任务，每天净学习 330 分钟', () => {
  assert.equal(courses.length, 17);
  assert.equal(new Set(courses.map(c => c.id)).size, 17);
  assert.equal(courses.reduce((sum,c)=>sum+c.days.length,0), 102);
  assert.equal(curriculumDays,102);
  assert.equal(curriculumHours,561);
  assert.equal(curriculumTasks,510);
  assert.equal(schedule.reduce((sum,s)=>sum+s.minutes,0), 330);
  assert.deepEqual(courses.map(c=>c.number),Array.from({length:17},(_,i)=>i+1));
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

test('AI 美术在第二章，四个阶段验收位于先修项目之后',()=>{
  assert.equal(courses[1].id,'aiart');
  assert.equal(courses[1].kind,'ai-art');
  const checkpoints=courses.filter(c=>c.kind==='checkpoint');
  assert.deepEqual(checkpoints.map(c=>c.number),[5,9,13,17]);
  assert.equal(courses.filter(c=>c.stage==='商业实战').length,4);
  for(const course of courses) {
    for(const prerequisite of course.prerequisites??[]) {
      const prior=courses.find(c=>c.id===prerequisite);
      assert.ok(prior,`${course.id} 的先修项目存在：${prerequisite}`);
      assert.ok(prior.number<course.number,`${course.id} 的先修项目已安排在前面`);
    }
  }
  for(const c of checkpoints) {
    assert.ok(c.prerequisites.length>=3);
    assert.equal(c.checkpoint.rubric.reduce((sum,row)=>sum+row.points,0),100,c.id);
    assert.equal(c.checkpoint.passScore,80,c.id);
    assert.ok(c.checkpoint.hardGates.length>=2);
    assert.ok(c.checkpoint.rubric.every(row=>row.points>0&&row.label&&row.evidence.length>15));
    assert.equal(new Set(c.checkpoint.rubric.map(row=>row.id)).size,c.checkpoint.rubric.length);
    assert.ok(c.checkpoint.requirements.length>=3&&c.checkpoint.reference&&c.checkpoint.brief);
  }
});

test('阶段自评要求至少 80 分且每个必过条件均满足，普通任务完成不影响验收',()=>{
  const course=courses.find(c=>c.id==='checkpointarcade');
  const allRubrics=Object.fromEntries(course.checkpoint.rubric.map(row=>[`${course.id}:rubric:${row.id}`,true]));
  const allGates=Object.fromEntries(course.checkpoint.hardGates.map((_,index)=>[`${course.id}:gate:${index}`,true]));
  assert.equal(assessCheckpoint(course,{}).started,false);
  assert.equal(assessCheckpoint(course,{}).passed,false);
  assert.equal(assessCheckpoint(course,allRubrics).score,100);
  assert.equal(assessCheckpoint(course,allRubrics).passed,false,'满分也不能跳过必过条件');
  assert.equal(assessCheckpoint(course,allGates).passed,false,'只有必过条件没有评分证据不能通过');
  const checks={...allRubrics,...allGates,[`${course.id}:rubric:review`]:false};
  assert.equal(assessCheckpoint(course,checks).score,80);
  assert.equal(assessCheckpoint(course,checks).passed,true,'80 分且全部必过条件满足恰好达标');
  checks[`${course.id}:gate:0`]=false;
  assert.equal(assessCheckpoint(course,checks).passed,false,'撤销一个必过条件后立即失去达标状态');
  checks[`${course.id}:gate:0`]=true;
  checks[`${course.id}:rubric:art`]=false;
  assert.equal(assessCheckpoint(course,checks).passed,false,'分数不足 80 分时需要补做');
  const dailyTasks=Object.fromEntries(course.days.flatMap((_,index)=>schedule.map(block=>[`${course.id}:${index}:${block.id}`,true])));
  assert.equal(assessCheckpoint(course,dailyTasks).score,0);
  assert.equal(assessCheckpoint(course,dailyTasks).passed,false);
  assert.equal(assessCheckpoint(courses[0],{}).passed,false);
});

test('学习记录可往返导出，保留笔记、正确率来源和时长',()=>{
  const p=emptyProgress();p.completed['pong:0:theory']=true;p.notes['pong:0']='测试世界坐标与界面坐标';p.artifacts['pong:0']='本地录像路径';p.quizAnswers['pong:0']=1;p.checkpointChecks['checkpointarcade:rubric:loop']=true;p.checkpointChecks['checkpointarcade:gate:0']=true;p.focusSeconds=421;p.focusByDate['2026-10-18']=421;p.lastCourse='bird';p.lastDay=2;
  assert.deepEqual(parseProgress(JSON.stringify({version:1,progress:p})),p);
});

test('旧备份缺少阶段自评仍能恢复，新备份仅接受有效的布尔验收记录',()=>{
  const legacy={completed:{'bird:0:theory':true},notes:{'steam:1':'旧章节笔记'},lastCourse:'steam',lastDay:1};
  const restored=parseProgress(JSON.stringify({version:1,progress:legacy}));
  assert.deepEqual(restored.checkpointChecks,{});
  assert.deepEqual(restored.completed,legacy.completed);
  assert.deepEqual(restored.notes,legacy.notes);
  assert.equal(restored.lastCourse,'steam');
  assert.equal(restored.lastDay,1);
  const newBackup={...legacy,checkpointChecks:{'checkpointarcade:rubric:loop':true,'checkpointarcade:gate:0':false,'checkpointarcade:gate:99':true,'checkpointarcade:rubric:unknown':true,'checkpointarcade:rubric:art':'true','pong:gate:0':true}};
  assert.deepEqual(parseProgress(JSON.stringify(newBackup)).checkpointChecks,{'checkpointarcade:rubric:loop':true,'checkpointarcade:gate:0':false});
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
