import { readFile } from 'node:fs/promises';
import { test as base, expect, type Page } from '@playwright/test';
import { courses } from '../src/data/courses';

const test = base.extend<{ runtimeGuard: void }>({
  runtimeGuard: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await use();
    expect(errors, '页面交互过程中不应出现未处理的运行时错误').toEqual([]);
  }, { auto: true }],
});

async function navigate(page: Page, label: string) {
  const navigation = page.getByRole('navigation', { name: '主导航' });
  const button = navigation.getByRole('button', { name: label, exact: false });
  const mobileMenu = page.getByRole('button', { name: '打开导航', exact: true });
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await button.click();
}

async function openFirstLesson(page: Page) {
  await page.getByRole('button', { name: '开启第一个项目', exact: false }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  return page.getByRole('dialog');
}

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('专注计时更新不会打断今日计划按钮的键盘焦点', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('button', { name: '开启专注时间', exact: false }).click();
  const dayButton=page.locator('.day-tabs button').nth(1);
  await dayButton.focus();
  await page.clock.runFor(2100);
  await expect(dayButton).toBeFocused();
  await dayButton.press('Enter');
  await expect(dayButton).toBeFocused();
  await expect(dayButton).toHaveClass('active');
});

test('无法读取的旧学习记录保留原始副本，不会被静默覆盖', async ({ page }) => {
  await page.evaluate(()=>localStorage.setItem('gamecraft-progress-v1','{"notes":{"pong:0":"需要恢复的笔记"'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('已保留原始恢复副本');
  const recovered=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('gamecraft-progress-v1-recovery-')).map(key=>localStorage.getItem(key)));
  expect(recovered).toContain('{"notes":{"pong:0":"需要恢复的笔记"');
  await expect(page.getByRole('button',{name:'下载原始记录',exact:true})).toBeVisible();
});

test('课程筛选、搜索、空状态与双引擎术语检索', async ({ page }) => {
  await navigate(page, '项目课程');
  await expect(page.locator('.course-card')).toHaveCount(17);
  const filters = page.getByRole('group', { name: '课程阶段' });
  await filters.getByRole('button', { name: '商业实战', exact: true }).click();
  await expect(page.locator('.course-card')).toHaveCount(4);
  await expect(page.locator('.course-card .cover-stage')).toHaveText(['商业实战', '商业实战', '商业实战', '阶段验收']);
  await page.getByRole('textbox', { name: '搜索课程' }).fill('不存在的课程 query_742');
  await expect(page.getByRole('heading', { name: '没有找到匹配的项目' })).toBeVisible();
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await expect(page.locator('.course-card')).toHaveCount(17);
  const firstTitle = (await page.locator('.course-card h3').first().textContent())!;
  await page.getByRole('textbox', { name: '搜索课程' }).fill(firstTitle);
  await expect(page.locator('.course-card')).toHaveCount(1);
  await page.getByRole('button', { name: '清除搜索', exact: true }).click();
  await expect(page.locator('.course-card')).toHaveCount(17);
  await navigate(page, '双引擎对照');
  await page.getByRole('textbox', { name: '搜索双引擎术语' }).fill('Prefab');
  await expect(page.locator('.comparison-row').first()).toContainText('Prefab');
  await expect(page.locator('.comparison-row')).not.toHaveCount(0);
  await page.locator('.comparison-row button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('每日任务各自保存，并在刷新后恢复', async ({ page }) => {
  let dialog = await openFirstLesson(page);
  const tasks = dialog.getByRole('checkbox');
  await expect(tasks).toHaveCount(5);
  await tasks.nth(0).check();
  await tasks.nth(1).check();
  await expect(dialog.locator('.lesson-completion')).toHaveText('2 / 5 已完成');
  await dialog.getByRole('navigation', { name: '选择学习日' }).getByRole('button').nth(1).click();
  await expect(dialog.getByRole('checkbox').first()).not.toBeChecked();
  await dialog.getByRole('checkbox').nth(2).check();
  await expect(dialog.locator('.lesson-completion')).toHaveText('1 / 5 已完成');
  await dialog.getByRole('button', { name: '关闭实作课堂' }).click();
  await page.reload();
  await page.getByRole('button', { name: '继续我的学习', exact: false }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.locator('.lesson-day[aria-current="step"]')).toContainText('第 2 天');
  await expect(dialog.getByRole('checkbox').nth(2)).toBeChecked();
  await dialog.getByRole('navigation', { name: '选择学习日' }).getByRole('button').first().click();
  await expect(dialog.getByRole('checkbox').nth(0)).toBeChecked();
  await expect(dialog.getByRole('checkbox').nth(1)).toBeChecked();
  await expect(dialog.getByRole('checkbox').nth(2)).not.toBeChecked();
});

test('引擎代码切换与复制使用当前代码', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const dialog = await openFirstLesson(page);
  await dialog.getByRole('tab', { name: '代码参考' }).click();
  const cocosCode = await dialog.locator('pre code').textContent();
  expect(cocosCode?.length).toBeGreaterThan(30);
  await dialog.getByRole('button', { name: 'Unity · C#', exact: true }).click();
  const unityCode = await dialog.locator('pre code').textContent();
  expect(unityCode).not.toBe(cocosCode);
  await dialog.getByRole('button', { name: '复制代码', exact: true }).click();
  await expect(dialog.getByRole('button', { name: '已复制', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(unityCode);
  await dialog.getByRole('button', { name: 'Cocos · TypeScript', exact: true }).click();
  await expect(dialog.locator('pre code')).toHaveText(cocosCode!);
});

test('自测给出正确与错误反馈，笔记和成果按学习日保存', async ({ page }) => {
  let dialog = await openFirstLesson(page);
  await dialog.getByRole('tab', { name: '验收与复盘' }).click();
  const quiz = dialog.locator('.lesson-quiz').first();
  const choices = quiz.getByRole('radio');
  let sawCorrect = false;
  let sawIncorrect = false;
  for (let index = 0; index < await choices.count(); index++) {
    await choices.nth(index).check();
    const message = await quiz.getByRole('status').textContent();
    sawCorrect ||= message!.includes('回答正确');
    sawIncorrect ||= message!.includes('再想一想');
  }
  expect(sawCorrect).toBe(true);
  expect(sawIncorrect).toBe(true);
  await dialog.getByRole('textbox', { name: '今日复盘笔记' }).fill('我已经对照完成组件与场景结构。\n明天验证输入与帧率。');
  await dialog.getByRole('textbox', { name: '今天的作品记录' }).fill('作品归档：projects/pong/day-1');
  await dialog.getByRole('button', { name: '继续下一天', exact: true }).click();
  await dialog.getByRole('tab', { name: '验收与复盘' }).click();
  await expect(dialog.getByRole('textbox', { name: '今日复盘笔记' })).toHaveValue('');
  await dialog.getByRole('button', { name: '前一天', exact: true }).click();
  await dialog.getByRole('tab', { name: '验收与复盘' }).click();
  await expect(dialog.getByRole('textbox', { name: '今日复盘笔记' })).toHaveValue('我已经对照完成组件与场景结构。\n明天验证输入与帧率。');
  await dialog.getByRole('button', { name: '关闭实作课堂' }).click();
  await page.reload();
  dialog = await openFirstLesson(page);
  await dialog.getByRole('tab', { name: '验收与复盘' }).click();
  await expect(dialog.getByRole('textbox', { name: '今日复盘笔记' })).toHaveValue('我已经对照完成组件与场景结构。\n明天验证输入与帧率。');
  await expect(dialog.getByRole('textbox', { name: '今天的作品记录' })).toHaveValue('作品归档：projects/pong/day-1');
  await expect(dialog.locator('.lesson-quiz').first().getByRole('radio').last()).toBeChecked();
});

test('导出包含学习记录，导入需要确认且恢复原记录', async ({ page }) => {
  const dialog = await openFirstLesson(page);
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByRole('tab', { name: '验收与复盘' }).click();
  await dialog.getByRole('textbox', { name: '今日复盘笔记' }).fill('导出与导入需要保留这条笔记');
  await dialog.getByRole('textbox', { name: '今天的作品记录' }).fill('https://example.com/my-pong');
  await dialog.getByRole('button', { name: '关闭实作课堂' }).click();
  await navigate(page, '学习记录');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出学习记录', exact: true }).click();
  const download = await downloadEvent;
  const data = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(data.version).toBe(1);
  expect(Object.values(data.progress.completed).filter(Boolean)).toHaveLength(1);
  expect(Object.values(data.progress.notes)).toContain('导出与导入需要保留这条笔记');
  expect(Object.values(data.progress.artifacts)).toContain('https://example.com/my-pong');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await navigate(page, '学习记录');
  await page.locator('input[type="file"]').setInputFiles({ name: 'learning-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.getByRole('dialog', { name: '导入学习备份' })).toBeVisible();
  await expect(page.locator('.record-stats')).toContainText('0 / 510');
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.locator('.record-stats')).toContainText('0 / 510');
  await page.locator('input[type="file"]').setInputFiles({ name: 'learning-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await page.getByRole('button', { name: '确认导入', exact: true }).click();
  await expect(page.locator('.record-stats')).toContainText('1 / 510');
  await expect(page.locator('.note-list')).toContainText('导出与导入需要保留这条笔记');
  await page.reload();
  await navigate(page, '学习记录');
  await expect(page.locator('.record-stats')).toContainText('1 / 510');
  await expect(page.locator('.note-list')).toContainText('导出与导入需要保留这条笔记');
});

test('格式错误的备份不会覆盖已有记录', async ({ page }) => {
  const dialog = await openFirstLesson(page);
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByRole('button', { name: '关闭实作课堂' }).click();
  await navigate(page, '学习记录');
  await page.locator('input[type="file"]').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"notes":{}}') });
  await expect(page.getByRole('status')).toContainText('缺少学习进度或笔记');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.record-stats')).toContainText('1 / 510');
});

test('专注时间按实际经过时间累计，暂停后不继续增加', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('button', { name: '开启专注时间', exact: false }).click();
  await page.clock.fastForward(65_000);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('gamecraft-progress-v1')!).focusSeconds)).toBe(65);
  await page.getByRole('button', { name: '暂停专注', exact: false }).click();
  await page.clock.fastForward(60_000);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gamecraft-progress-v1')!).focusSeconds)).toBe(65);
  await navigate(page, '学习记录');
  await expect(page.locator('.record-stats')).toContainText('1 分钟');
  await page.reload();
  await expect(page.getByRole('button', { name: '开启专注时间', exact: false })).toBeVisible();
});

test('课堂键盘导航、焦点循环与 Escape 关闭', async ({ page }) => {
  const opener = page.getByRole('button', { name: '开启第一个项目', exact: false });
  const dialog = await openFirstLesson(page);
  const close = dialog.getByRole('button', { name: '关闭实作课堂' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: '继续下一天', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await dialog.getByRole('tab', { name: '今日实作' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: '双引擎对照' })).toBeFocused();
  await expect(dialog.getByRole('tab', { name: '双引擎对照' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(dialog.getByRole('tab', { name: '验收与复盘' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('AI 美术工坊生成可复制提示词，并导出正确尺寸的透明 PNG 与素材清单', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await navigate(page, 'AI 美术工坊');
  await page.getByRole('textbox', { name: '素材主体', exact: true }).fill('戴黄色围巾的小机器人');
  await page.getByRole('combobox', { name: '生成尺寸', exact: true }).selectOption('1024');
  const prompt = page.getByRole('textbox', { name: '生成的美术提示词', exact: true });
  await expect(prompt).toHaveValue(/戴黄色围巾的小机器人/);
  await expect(prompt).toHaveValue(/1024 × 1024/);
  await page.getByRole('button', { name: '复制提示词', exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(await prompt.inputValue());
  await page.locator('.art-recipes button').filter({ hasText: '背景：给玩法留空间' }).click();
  await expect(page.getByRole('combobox', { name: '素材类型', exact: true })).toHaveValue('背景');
  await expect(prompt).toHaveValue(/背景图可以不透明/);
  await page.getByRole('combobox', { name: '素材类型', exact: true }).selectOption('界面');
  await expect(prompt).toHaveValue(/九宫格切片/);

  await page.getByRole('combobox', { name: 'PNG 导出宽度', exact: true }).selectOption('512');
  for (const asset of [{ name: '薄荷小队员', file: 'player-512x512.png', width: 512, height: 512 }, { name: '苔绿浮岛', file: 'platform-512x128.png', width: 512, height: 128 }]) {
    const event = page.waitForEvent('download');
    await page.getByRole('button', { name: `下载${asset.name} PNG`, exact: true }).click();
    const download = await event;
    expect(download.suggestedFilename()).toBe(asset.file);
    const png = await readFile((await download.path())!);
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png.toString('ascii', 12, 16)).toBe('IHDR');
    expect(png.readUInt32BE(16)).toBe(asset.width);
    expect(png.readUInt32BE(20)).toBe(asset.height);
    expect(png[25], '导出的 PNG 包含透明度通道').toBe(6);
    await expect(page.locator('.art-status')).toContainText(`${asset.width} × ${asset.height}`);
  }
  const manifestEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载素材清单 CSV', exact: true }).click();
  const manifest = await manifestEvent;
  const csv = await readFile((await manifest.path())!, 'utf8');
  expect(csv).toContain('filename,width,height,format,source,license,pivot');
  expect(csv).toContain('player-512x512.png,512,512,PNG RGBA');
  expect(csv).toContain('platform-512x128.png,512,128,PNG RGBA');
  expect(csv).toContain('可使用修改并用于商业游戏无需署名');
  expect(csv.trim().split('\r\n')).toHaveLength(6);
});

test('阶段验收与学习任务独立，80 分加全部必过条件达标并在刷新后保留', async ({ page }) => {
  const course = courses.find(item => item.id === 'checkpointarcade')!;
  await navigate(page, '项目课程');
  await page.getByRole('button', { name: `学习项目 ${course.title}`, exact: true }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.locator('.lesson-checkpoint-preview')).toContainText('待验收');
  await dialog.getByRole('button', { name: '打开阶段验收', exact: true }).click();
  const rubric = dialog.locator('.lesson-checkpoint-checklist').first().getByRole('checkbox');
  const gates = dialog.locator('.lesson-checkpoint-gates').getByRole('checkbox');
  for (let index = 0; index < await rubric.count(); index++) await rubric.nth(index).check();
  await expect(dialog.locator('.lesson-checkpoint-score strong')).toHaveText('100 / 100');
  await expect(dialog.locator('.lesson-checkpoint-assessment .lesson-checkpoint-state')).toHaveText('需要补做');
  for (let index = 0; index < await gates.count() - 1; index++) await gates.nth(index).check();
  await expect(dialog.locator('.lesson-checkpoint-result')).toContainText('需要补做');
  await gates.last().check();
  await expect(dialog.locator('.lesson-checkpoint-result')).toContainText('自评达标，仍需按证据复核');
  await rubric.last().uncheck();
  await expect(dialog.locator('.lesson-checkpoint-score strong')).toHaveText('80 / 100');
  await expect(dialog.locator('.lesson-checkpoint-assessment .lesson-checkpoint-state')).toHaveText('自评达标');
  await dialog.getByRole('tab', { name: '今日实作', exact: true }).click();
  await expect(dialog.locator('.lesson-completion')).toHaveText('0 / 5 已完成');
  await dialog.getByRole('button', { name: '关闭实作课堂', exact: true }).click();
  await page.reload();
  await navigate(page, '项目课程');
  const card = page.getByRole('button', { name: `学习项目 ${course.title}`, exact: true });
  await expect(card).toContainText('自评达标');
  await card.click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '打开阶段验收', exact: true }).click();
  await expect(dialog.locator('.lesson-checkpoint-score strong')).toHaveText('80 / 100');
  const restoredGates = dialog.locator('.lesson-checkpoint-gates').getByRole('checkbox');
  for (let index = 0; index < await restoredGates.count(); index++) await expect(restoredGates.nth(index)).toBeChecked();
  await restoredGates.first().uncheck();
  await expect(dialog.locator('.lesson-checkpoint-result')).toContainText('需要补做');
});

test('课程重排后 AI 课程和商业入口仍打开对应项目', async ({ page }) => {
  await navigate(page, 'AI 美术工坊');
  await page.getByRole('button', { name: '开始 AI 美术实作课', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(courses.find(course => course.id === 'aiart')!.title);
  await page.getByRole('button', { name: '关闭实作课堂', exact: true }).click();
  await navigate(page, '变现与发行');
  for (const [index, id] of ['ads', 'steam', 'switch'].entries()) {
    await page.locator('.business-card').nth(index).getByRole('button', { name: '进入实战章节', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(courses.find(course => course.id === id)!.title);
    await page.getByRole('button', { name: '关闭实作课堂', exact: true }).click();
  }
});

test('手机页面、课程弹层和所有主页面均无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const assertNoOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await assertNoOverflow();
  const dialog = await openFirstLesson(page);
  await expect(dialog).toBeVisible();
  await assertNoOverflow();
  await expect(dialog.getByRole('button', { name: '继续下一天', exact: true })).toBeVisible();
  for (const name of ['双引擎对照', '代码参考', '验收与复盘', '今日实作']) {
    await dialog.getByRole('tab', { name, exact: true }).click();
    await assertNoOverflow();
  }
  await dialog.getByRole('navigation', { name: '选择学习日' }).getByRole('button').last().click();
  await expect(dialog.getByRole('button', { name: '返回学习路径', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '关闭实作课堂' }).click();
  for (const section of ['项目课程', '今日计划', 'AI 美术工坊', '双引擎对照', '变现与发行', '学习记录']) {
    await navigate(page, section);
    await assertNoOverflow();
  }
  await navigate(page, '项目课程');
  await page.getByRole('group', { name: '课程类型' }).getByRole('button', { name: '阶段验收', exact: true }).click();
  await expect(page.locator('.course-card')).toHaveCount(4);
  await page.locator('.course-card').first().click();
  await assertNoOverflow();
  await page.getByRole('dialog').getByRole('button', { name: '打开阶段验收', exact: true }).click();
  await assertNoOverflow();
  await expect(page.locator('.lesson-checkpoint-assessment')).toBeVisible();
  await expect(page.locator('.lesson-dialog')).toHaveJSProperty('scrollWidth', 390);
});
