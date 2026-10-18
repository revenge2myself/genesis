import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Copy, Download, ExternalLink, Image, Layers3, Palette, Sparkles } from 'lucide-react';
import { artPromptRecipes } from '../data/aiArtCourse';
import './art-workbench.css';

type Asset = { id: string; title: string; usage: string; wide?: boolean; body: string };
const assets: Asset[] = [
  { id: 'player', title: '薄荷小队员', usage: '玩家角色 · 中心锚点', body: '<ellipse cx="128" cy="206" rx="60" ry="12" fill="#233d45" opacity=".14"/><path d="M71 178V99a57 57 0 0 1 114 0v79q0 24-24 24H95q-24 0-24-24Z" fill="#77c9b1" stroke="#355d56" stroke-width="8"/><path d="M85 93q43-36 86 0" fill="none" stroke="#c5f2dd" stroke-width="10" stroke-linecap="round"/><rect x="88" y="105" width="80" height="49" rx="24" fill="#eefcf3"/><circle cx="111" cy="129" r="7" fill="#304e4b"/><circle cx="145" cy="129" r="7" fill="#304e4b"/><path d="M120 167q8 7 16 0" fill="none" stroke="#355d56" stroke-width="5" stroke-linecap="round"/><path d="M84 199v12m88-12v12" stroke="#355d56" stroke-width="14" stroke-linecap="round"/>' },
  { id: 'star', title: '蜂蜜能量星', usage: '收集物 · 圆形碰撞体', body: '<path d="m128 32 28 58 64 9-46 45 11 64-57-30-57 30 11-64-46-45 64-9Z" fill="#f6cd68" stroke="#ac7c32" stroke-width="8" stroke-linejoin="round"/><path d="m128 55 19 46 43 6" fill="none" stroke="#fff0b1" stroke-width="9" stroke-linecap="round"/><circle cx="111" cy="132" r="5" fill="#8b642c"/><circle cx="145" cy="132" r="5" fill="#8b642c"/>' },
  { id: 'enemy', title: '紫莓小守卫', usage: '敌人角色 · 中心锚点', body: '<path d="m74 88-8-40 42 29m74 11 8-40-42 29" fill="#aa93cc" stroke="#62547f" stroke-width="8" stroke-linejoin="round"/><path d="M62 137q0-64 66-64t66 64v59l-22-12-22 16-22-16-22 16-22-16-22 12Z" fill="#b8a4da" stroke="#62547f" stroke-width="8" stroke-linejoin="round"/><path d="m88 119 25 8m55-8-25 8" stroke="#62547f" stroke-width="7" stroke-linecap="round"/><circle cx="104" cy="139" r="7" fill="#fff9ef"/><circle cx="152" cy="139" r="7" fill="#fff9ef"/><path d="M118 165h20" stroke="#62547f" stroke-width="5" stroke-linecap="round"/>' },
  { id: 'platform', title: '苔绿浮岛', usage: '地面平台 · 底部中心锚点', wide: true, body: '<path d="M12 32h488v61l-36 25H48L12 93Z" fill="#ab8b6a" stroke="#6b6551" stroke-width="7" stroke-linejoin="round"/><path d="M12 18h488v35q-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-37 0-18 20-44 0Z" fill="#85b99a" stroke="#507b60" stroke-width="7" stroke-linejoin="round"/><path d="M52 82h34m52 15h20m88-15h38m74 15h21m60-15h20" stroke="#d7b890" stroke-width="8" stroke-linecap="round"/>' },
  { id: 'button', title: '海盐按钮底板', usage: '界面底板 · 可加引擎文字', wide: true, body: '<rect x="12" y="18" width="488" height="99" rx="27" fill="#376a77"/><rect x="12" y="10" width="488" height="96" rx="27" fill="#7cb9c6" stroke="#376a77" stroke-width="6"/><path d="M45 25h422" stroke="#b5e1e7" stroke-width="8" stroke-linecap="round"/>' },
];
const recipes = [
  { title: '角色：先保证看得清', type: '角色', subject: '一个薄荷绿色的圆形探险机器人', detail: '单角色、正面、轮廓清晰，先制作一帧，再逐帧补动作。' },
  { title: '背景：给玩法留空间', type: '背景', subject: '安静的浮岛森林，中央留出宽阔的游戏区域', detail: '主体放在两侧，前中后景分开导出，避免背景遮挡敌人。' },
  { title: '界面：文字交给引擎', type: '界面', subject: '一个圆角的海盐蓝色游戏按钮底板', detail: '只生成无字底板；文字、点击态与交互在引擎中制作。' },
  { title: '图标：缩小后仍可辨认', type: '图标', subject: '一颗蜂蜜黄色的能量星星', detail: '先检查 32 像素可读性，再决定细节；避免复杂光效。' },
];
const svgFor = (asset: Asset, size: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${asset.wide ? size / 4 : size}" viewBox="0 0 ${asset.wide ? '512 128' : '256 256'}">${asset.body}</svg>`;
const dataFor = (asset: Asset) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgFor(asset, asset.wide ? 512 : 256))}`;

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function ArtWorkbench({ onOpenCourse }: { onOpenCourse: () => void }) {
  const [kind, setKind] = useState('角色');
  const [subject, setSubject] = useState(recipes[0].subject);
  const [style, setStyle] = useState('简洁扁平插画，圆润轮廓，少量细节');
  const [palette, setPalette] = useState('薄荷绿 #77C9B1、奶油白 #FFF9EF、深青灰 #355D56');
  const [resolution, setResolution] = useState('512');
  const [assetSize, setAssetSize] = useState(256);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const prompt = useMemo(() => [
    `请为原创 2D 游戏制作${kind}素材。`,
    `主体：${subject.trim() || '请填写一个原创游戏主体'}。`,
    `美术风格（Art Style）：${style}。`,
    `配色（Color Palette）：${palette.trim() || '使用不超过 4 种主色'}。`,
    `画布：${resolution} × ${resolution} 像素。`,
    kind === '背景' ? '画面中央保留低细节的游戏活动区，前景与背景层次分明。不要加入角色、文字或界面。' : '单个主体居中，四周留 10% 安全边距，轮廓完整，无文字、无水印、无品牌标志。',
    kind === '角色' ? '正面全身，统一光照与视角，双脚基线一致；本次只生成一个静止姿势，不生成精灵图集。' : kind === '界面' ? '制作无字按钮底板，边缘留出九宫格切片（9-slice）空间，按钮文字由游戏引擎添加。' : kind === '图标' ? '即使缩小到 32 × 32 像素也能辨认，避免复杂的渐变与光效。' : '使用柔和低对比背景，交互物体将由游戏引擎单独添加。',
    kind === '背景' ? '背景图可以不透明；需要视差滚动时，另行逐层生成前景、中景与远景。' : '如工具支持，请输出真正透明的 PNG（Alpha 通道）；否则输出纯色背景，方便后续抠图。不要用棋盘格冒充透明背景。',
    '所有元素使用原创设计，不模仿现有游戏角色、商标或特定艺术家的个人风格。',
  ].join('\n'), [kind, subject, style, palette, resolution]);

  const copyText = async (text: string, fieldId: string, success: string) => {
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied = true; } } catch { /* Browser permissions may require manual copying. */ }
    if (!copied) {
      const field = document.getElementById(fieldId) as HTMLTextAreaElement | null;
      field?.focus();
      field?.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
    }
    setFeedback(copied ? success : '浏览器未允许复制。请选中提示词，手动复制。');
  };
  const copyPrompt = () => copyText(prompt, 'art-prompt', '提示词已复制。请粘贴到你选择的图像生成工具中。');
  const recipeLabels: Record<string, string> = { style: '风格卡', character: '角色与掉落物', animation: '两帧对齐', background: '背景与界面' };

  const downloadPng = async (asset: Asset) => {
    setBusy(asset.id);
    const source = URL.createObjectURL(new Blob([svgFor(asset, assetSize)], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('无法读取图像')); img.src = source; });
      const canvas = document.createElement('canvas');
      canvas.width = assetSize;
      canvas.height = asset.wide ? assetSize / 4 : assetSize;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('浏览器不支持画布');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('无法导出图片')), 'image/png'));
      saveBlob(blob, `${asset.id}-${canvas.width}x${canvas.height}.png`);
      setFeedback(`已准备下载「${asset.title}」透明 PNG，${canvas.width} × ${canvas.height} 像素。`);
    } catch {
      setFeedback(`「${asset.title}」PNG 导出失败，请使用旁边的 SVG 下载按钮，再在图像编辑器中转成 PNG。`);
    } finally { URL.revokeObjectURL(source); setBusy(null); }
  };

  const downloadManifest = () => {
    const rows = ['filename,width,height,format,source,license,pivot', ...assets.map(asset => `${asset.id}-${assetSize}x${asset.wide ? assetSize / 4 : assetSize}.png,${assetSize},${asset.wide ? assetSize / 4 : assetSize},PNG RGBA,原创占位素材,可使用修改并用于商业游戏无需署名,${asset.id === 'platform' ? 'bottom-center' : 'center'}`)];
    saveBlob(new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'original-asset-manifest.csv');
    setFeedback('素材清单已准备下载；尺寸与你当前选择的 PNG 导出尺寸一致。');
  };

  return <div className="art-workbench">
    <section className="art-hero">
      <div className="art-hero-copy">
        <span className="art-kicker"><Sparkles size={14} /> 零美术基础，也能开始做游戏</span>
        <h2 className="art-hero-title">把你的想法，<br />变成能用的游戏美术。</h2>
        <p>先用原创素材跑通玩法，再学习 AI 美术（AI Art）的生成、清理和导入。你的第一步，是让游戏真正动起来。</p>
        <button className="primary-button" onClick={onOpenCourse}>开始 AI 美术实作课 <ArrowRight size={14} /></button>
      </div>
      <div className="art-hero-preview" aria-hidden="true"><span className="art-orbit art-orbit-one" /><span className="art-orbit art-orbit-two" /><img className="art-hero-star" src={dataFor(assets[1])} alt="" /><img className="art-hero-player" src={dataFor(assets[0])} alt="" /><span className="art-preview-label"><span /> 从占位素材到自己的风格</span></div>
    </section>

    <div className="art-flow" aria-label="美术制作流程">{['定义风格', '生成与筛选', '抠图与规格化', '导入双引擎', '在游戏中验收'].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}{index < 4 && <ArrowRight size={13} />}</div>)}</div>

    <section className="art-section" aria-labelledby="art-builder-title">
      <div className="art-section-heading"><div><span className="art-section-kicker">01 / 描述你的素材</span><h2 id="art-builder-title"><Palette size={18} /> 提示词工作台</h2><p>提示词（Prompt）只是制作起点；一致性与游戏中的可读性，由你验收。</p></div></div>
      <div className="art-builder">
        <div className="art-form">
          <div className="art-field-row"><label>素材类型<select aria-label="素材类型" value={kind} onChange={event => setKind(event.target.value)}>{['角色', '背景', '界面', '图标'].map(value => <option key={value}>{value}</option>)}</select></label><label>生成尺寸<select aria-label="生成尺寸" value={resolution} onChange={event => setResolution(event.target.value)}><option value="512">512 × 512</option><option value="1024">1024 × 1024</option></select></label></div>
          <label>你要画什么？<input aria-label="素材主体" value={subject} maxLength={240} onChange={event => setSubject(event.target.value)} placeholder="例如：圆形的薄荷绿探险机器人" /></label>
          <label>统一美术风格<select aria-label="美术风格" value={style} onChange={event => setStyle(event.target.value)}><option>简洁扁平插画，圆润轮廓，少量细节</option><option>低分辨率像素画，硬边缘，有限调色板</option><option>柔和纸片拼贴，简单几何，低对比纹理</option></select></label>
          <label>配色方案<input aria-label="配色方案" value={palette} maxLength={180} onChange={event => setPalette(event.target.value)} /></label>
          <div className="art-form-note"><Image size={16} /><p>本页只生成文字提示词，不向 AI 服务发送请求，也不需要密钥。复制后，在你选择的图像工具中生成图片；工具费用与商用条款需自行查看。</p></div>
        </div>
        <div className="art-prompt-panel"><div className="art-prompt-heading"><label htmlFor="art-prompt">生成的美术提示词</label><span>可直接复制</span></div><textarea id="art-prompt" aria-label="生成的美术提示词" value={prompt} readOnly spellCheck={false} /><div className="art-prompt-actions"><button className="primary-button" onClick={copyPrompt}><Copy size={14} /> 复制提示词</button><a href="https://chatgpt.com/" target="_blank" rel="noreferrer">打开图像工具 <ExternalLink size={13} /></a></div></div>
      </div>
      <div className="art-recipes">{recipes.map(recipe => <button key={recipe.type} onClick={() => { setKind(recipe.type); setSubject(recipe.subject); setFeedback(`已载入${recipe.type}提示词模板，可继续修改。`); }}><strong>{recipe.title}</strong><span>{recipe.detail}</span><small>使用这个模板 <ArrowRight size={12} /></small></button>)}</div>
      <div className="art-course-templates" aria-labelledby="art-course-templates-title">
        <div className="art-template-heading"><h3 id="art-course-templates-title">第二章配套 · 星光采集模板</h3><p>从风格卡（Style Guide）开始，再逐张制作素材。展开模板即可复制，并按验收点检查生成结果。</p></div>
        <div className="art-template-grid">{artPromptRecipes.map((recipe, index) => <details key={recipe.id} className="art-course-template" open={recipe.id === 'style'}>
          <summary><span className="art-template-number">0{index + 1}</span><span><strong>{recipe.title}</strong><small>{recipe.id === 'animation' ? '精灵图集（Sprite Sheet）· 人工对齐不可跳过' : recipe.purpose}</small></span></summary>
          <div className="art-template-body"><p>{recipe.purpose}</p><label htmlFor={`art-course-prompt-${recipe.id}`}>{recipeLabels[recipe.id]}提示词</label><textarea id={`art-course-prompt-${recipe.id}`} value={recipe.prompt} readOnly spellCheck={false} /><button className="outline-button" onClick={() => void copyText(recipe.prompt, `art-course-prompt-${recipe.id}`, `${recipeLabels[recipe.id]}模板已复制。请先阅读验收点，再到你选择的 AI 工具中使用。`)}><Copy size={13} />复制{recipeLabels[recipe.id]}模板</button><div className="art-template-acceptance"><strong><CheckCircle2 size={13} /> 验收这一步</strong><ul>{recipe.acceptance.map(item => <li key={item}>{item}</li>)}</ul></div></div>
        </details>)}</div>
      </div>
    </section>

    <div className="art-status" role="status" aria-live="polite">{feedback || '素材和提示词均可直接使用；你的输入仅留在当前页面。'}</div>

    <section className="art-section" aria-labelledby="art-assets-title">
      <div className="art-section-heading"><div><span className="art-section-kicker">02 / 今天就有素材可用</span><h2 id="art-assets-title"><Layers3 size={18} /> 你的第一包游戏素材</h2><p>原创占位素材，可用于你的游戏。它们是本地绘制的矢量图形，并非 AI 生成；可修改、可商用，无需署名。</p></div><label className="art-export-size">PNG 导出宽度<select aria-label="PNG 导出宽度" value={assetSize} onChange={event => setAssetSize(Number(event.target.value))}><option value={256}>256 像素</option><option value={512}>512 像素</option></select></label></div>
      <div className="art-asset-grid">{assets.map(asset => <article className="art-asset" key={asset.id}><div className={`art-asset-preview${asset.wide ? ' art-wide' : ''}`}><img src={dataFor(asset)} alt={`${asset.title}原创素材预览`} loading="lazy" /><span>透明背景</span></div><div className="art-asset-info"><h3>{asset.title}</h3><p>{asset.usage}</p><small>{assetSize} × {asset.wide ? assetSize / 4 : assetSize} px · PNG / SVG</small><div className="art-asset-actions"><button className="art-download" disabled={busy !== null} onClick={() => void downloadPng(asset)} aria-label={`下载${asset.title} PNG`}><Download size={13} />{busy === asset.id ? '导出中…' : 'PNG'}</button><button className="art-svg-download" onClick={() => { saveBlob(new Blob([svgFor(asset, assetSize)], { type: 'image/svg+xml' }), `${asset.id}.svg`); setFeedback(`已准备下载「${asset.title}」SVG 源文件。`); }} aria-label={`下载${asset.title} SVG`}>SVG 源文件</button></div></div></article>)}</div>
      <div className="art-manifest"><div><strong>素材来源清单（Asset Manifest）</strong><p>记录文件名、尺寸、来源与使用许可。每次添加外部或 AI 素材，也保留工具版本、生成日期及当时的条款。</p></div><button className="outline-button" onClick={downloadManifest}><Download size={14} /> 下载素材清单 CSV</button></div>
    </section>

    <section className="art-section" aria-labelledby="art-import-title"><div className="art-section-heading"><div><span className="art-section-kicker">03 / 从图片到游戏对象</span><h2 id="art-import-title">同一套素材，导入两个引擎</h2><p>PNG 可直接用于首个 2D 项目；SVG 是可编辑源文件，默认先转成 PNG 再导入。</p></div></div><div className="art-engine-grid">
      <article><span className="art-engine-label art-engine-cocos">Cocos Creator</span><h3>精灵帧（SpriteFrame）</h3><ol><li>把 PNG 拖入资源管理器，确认导入类型为精灵帧，再拖到节点的精灵（Sprite）组件。</li><li>设置 UITransform 的尺寸与锚点（Anchor）：角色用 (0.5, 0.5)，地面用 (0.5, 0)。碰撞体按可见轮廓单独设置。</li><li>普通插画使用双线性过滤（Bilinear）；像素画使用最近邻过滤（Nearest），并保持整数缩放。</li><li>按钮文字使用 Label 组件。需要拉伸底板时，在精灵帧编辑器设置边框，再用九宫格（Sliced）模式。</li></ol></article>
      <article><span className="art-engine-label art-engine-unity">Unity</span><h3>二维精灵（Sprite 2D）</h3><ol><li>把 PNG 放入 Assets，在 Inspector 将纹理类型（Texture Type）设置为 Sprite (2D and UI)，点击 Apply。</li><li>统一每单位像素（Pixels Per Unit），例如 100；角色轴心（Pivot）用 Center，地面用 Bottom，碰撞体另行调整。</li><li>开启透明度（Alpha Is Transparency）。插画过滤用 Bilinear；像素画用 Point，关闭有损压缩，并保持整数缩放。</li><li>按钮用 UI Image 搭配文字组件。需要拉伸时，在 Sprite Editor 设置 Border，再选择 Sliced 类型。</li></ol></article>
    </div><div className="art-checklist"><CheckCircle2 size={20} /><div><strong>导入后，做一次 10 分钟素材验收</strong><p>在深色与浅色背景分别检查透明边缘 → 把角色缩小到实际游戏尺寸 → 对比玩家与敌人的轮廓 → 检查碰撞体 → 点击按钮并测试不同窗口尺寸。能看清、能交互，才算完成。</p></div></div></section>
  </div>;
}
