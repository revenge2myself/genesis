import type { Course } from '../types';

export const artPromptRecipes: {
  id: string; title: string; purpose: string; prompt: string; acceptance: string[];
}[] = [
  {
    id: 'style', title: '先写一张可执行的风格卡', purpose: '复制到你选择的 AI 工具；先约定视觉规则，再生成素材。',
    prompt: '请为原创二维小游戏《星光采集》写一页中文美术规范。我没有绘画基础。游戏是左右移动小收集器，60 秒内接住落下的星星。采用扁平几何、圆角、正面视角、左上光源；主色 #183E42、#92DFC7、#FFE49B，危险物用 #EF8F8F。角色显示尺寸 64×64，星星 32×32，背景 960×540。请列出角色轮廓、留白、描边、阴影、按钮状态、文件命名和一张素材清单。不要借用已有游戏角色、标识或画风作者姓名；不要在图中生成文字。最后给我 5 条可客观检查的一致性标准。',
    acceptance: ['一页规范足够指导下一次生成；颜色、视角、尺寸都有明确数值。', '素材清单区分必须与可选，第一版只需角色、星星、危险物、背景、按钮。'],
  },
  {
    id: 'character', title: '角色与掉落物：先把单张做对', purpose: '需要支持图像输出的工具；可附上自己的风格卡和已有角色作参考。',
    prompt: '为我的原创游戏《星光采集》生成一个正面小收集器：薄荷绿圆角小桶，两个简洁白色眼睛，深青色等宽描边，左上柔光，无文字、无标志、无地面、无投影。单个完整主体居中，四周留白 10%，512×512 画布，最终将缩小到 64×64 使用；形状应在小尺寸仍可辨认。输出真正透明背景的 PNG（Alpha），不要绘制棋盘格。如果工具不支持透明输出，请明确说明，并给纯色背景方便后续去背。沿用我提供的配色和参考图，保持正面视角。确认这张后，再分别生成同风格金色五角星与珊瑚红危险晶体，不要把多件素材拼在同一张图里。',
    acceptance: ['在深浅两种背景上查看，透明区没有棋盘格、白边或残影。', '缩小到实际显示尺寸仍能区分角色、奖励和危险物；外轮廓完整。'],
  },
  {
    id: 'animation', title: '两帧表情与可切片图集', purpose: '生成候选帧后，必须手动对齐再排成图集；模型不能保证逐帧一致。',
    prompt: '以我提供的原创收集器图片为唯一角色参考，生成一张“接到星星时眯眼微笑”的候选图。保持正面视角、轮廓、桶口位置、光源、配色、描边和画布留白完全一致，只改变眼睛表情，不改变身体比例。透明 PNG，512×512，无文字。原图作为待机帧，本图作为反馈帧。请另外列出人工复核点：底部中心锚点、角色包围盒、眼睛位置与透明边缘。我会在免费图像编辑器中把两帧对齐为 64×64，再横排成 128×64 图集；不要声称生成结果已经像素级对齐。',
    acceptance: ['两帧在同一画布原点切换，没有位置漂移或身体忽大忽小。', '如果模型反复改坏角色，直接保留静态精灵，用缩放和颜色反馈完成游戏。'],
  },
  {
    id: 'background', title: '背景和界面：玩法读得清才合格', purpose: '背景先单独生成，文字、按钮布局在引擎中完成。',
    prompt: '为原创小游戏《星光采集》生成 960×540 横屏背景。扁平几何、圆角、深青与低饱和薄荷色、左上柔光。中央 70% 是接落下星星的活动区域，保持低对比和少细节；顶部 15% 留给分数和倒计时，底部留给收集器。只画远处天空和极简山丘，不画角色、星星、按钮、文字、商标。不要仿制已有游戏画面。另用文字给出远景与前景拆层建议；若工具不能输出独立图层，请直接说明，单层背景也必须可用。',
    acceptance: ['金色星星和红色危险物在背景所有位置都清晰可见。', '文字使用引擎字体；背景不会承担按钮点击区域或碰撞判定。'],
  },
];

export const aiArtCourse: Course = {
  id: 'aiart', number: 2, title: '星光采集 · AI 美术入门',
  subtitle: '没有绘画基础，也能从占位图走到可玩的原创画面',
  description: '制作一款 60 秒接星星小游戏，在 Cocos 与 Unity 中完成相同玩法。用页面提供的原创占位资源开始，再学习风格卡、提示词、透明素材、精灵导入和性能检查。外部 AI 图像工具是可选环节：不要求付费、API 或本地 GPU；没有生成额度也能完成整章。每天沿用 330 分钟学习安排。',
  stage: '基础入门', kind: 'ai-art', prerequisites: ['pong'], theme: 'lavender', art: 'aiart',
  tags: ['零美术基础', 'AI 美术', '素材工作流'],
  concepts: [
    { zh: '风格规范', en: 'Style Guide', same: '先约定视角、配色、轮廓和尺寸；每件素材都按同一张清单验收。', cocos: '用相同 UITransform 尺寸和 Sprite 显示模式检查风格是否一致。', unity: '用一致的每单位像素数与正交相机尺寸检查实际显示效果。' },
    { zh: '透明通道', en: 'Alpha Channel', same: '透明是像素的透明度数据；画在图片里的棋盘格只是颜色，不是真透明。', cocos: '导入 PNG 后检查 SpriteFrame 的透明边缘；节点透明度不能去掉图片里的白底。', unity: '贴图设为 Sprite (2D and UI)，检查 Alpha 来源与边缘，再观察运行画面。' },
    { zh: '锚点', en: 'Pivot / Anchor', same: '动画帧切换时，尺寸和视觉基准需要一致；碰撞形状应服务公平玩法。', cocos: 'UITransform 的 anchorPoint 决定节点定位，配合固定画布与 SpriteFrame 裁切设置。', unity: 'Sprite Editor 的 Pivot 决定精灵基准，Pixels Per Unit（每单位像素数）决定世界尺寸。' },
    { zh: '纹理图集', en: 'Texture Atlas', same: '把素材打包可减少部分纹理切换；能否合批还取决于材质、顺序与渲染状态。', cocos: '使用自动图集配置，在构建包中验证 Draw Call（绘制调用）和内存。', unity: '使用 Sprite Atlas，结合 Frame Debugger（帧调试器）检查实际批次。' },
  ],
  days: [
    {
      title: '先用几何素材做出接星星', goal: '两个引擎都能完整玩一局，建立美术替换之前的玩法基线。',
      concept: '灰盒原型（Graybox Prototype）用简单形状验证规则。画面资源和判定分离，换图时就不需要重写计分与输入。页面资源工作台中的图片是原创占位素材，不是 AI 生成结果；下载 PNG 即可开始。',
      steps: ['读规则并列对象：960×540 场地，底部收集器，落下星星，60 秒倒计时、分数、开始与重开；使用第 1 章的输入和状态机。', '下载占位 PNG；每 0.8 秒在安全水平范围生成一颗星，以每秒 150 像素下落。左右键和拖动控制收集器，并限制在画面内。', '分别用 Cocos 的像素坐标与 Unity 的世界单位实现同一规则：收集器半宽 40 像素、星半径 12 像素，矩形重叠只加一次 10 分；落地即移除，倒计时归零停止生成与计分。', '独立完成结束面板和重开，连续玩三局；记录两个版本的速度换算、规则差异和仍需查阅的接口，再归档截图。'],
      cocos: 'Canvas 下建立 Catcher、Drops、HUD；用 UITransform 定尺寸。用父节点的局部坐标统一判定，触摸位置先转换到同一坐标系。控制器保存剩余时间与分数，update(dt) 只在 Playing 状态推进；重开清空掉落物和生成计时。',
      unity: '用正交相机和 SpriteRenderer 显示场景，Canvas + TextMeshPro 显示界面；设 100 Pixels Per Unit，960 像素对应 9.6 世界单位，下落速度为 1.5。复用第 1 章 Input System；指针转世界坐标后限制横坐标。',
      acceptance: ['两份工程都有开始 → 60 秒游玩 → 结算 → 重开闭环；超时后分数固定。', '接到星星只加一次分，重开没有遗留掉落物；同一操作在两个引擎中节奏接近。'],
      reflection: '把星星换成钻石后，哪些显示参数应改变，哪些判定与分数规则应保持独立？',
    },
    {
      title: '用风格卡和提示词获得第一套素材', goal: '得到一套能导入游戏的候选美术，并知道如何检查来源与透明度。',
      concept: '提示词（Prompt）是给工具的需求说明，不是质量保证。可选择自己能使用的 ChatGPT 图像功能、Stable Diffusion 或 ComfyUI；服务、模型与插件的费用、硬件和许可各不相同。本课不要求安装本地模型或接入 API。',
      steps: ['复制工作台的风格卡模板，自己决定三种主色、正面视角和实际显示尺寸；列出角色、奖励、危险物、背景、按钮五类资源。', '在可用的外部工具中先试一张角色，再以通过的角色为参考生成星星；记录提示词和生成日期。无可用工具时用占位素材做同一套配色与导入练习，并保存待执行的提示词。', '在免费 GIMP 或 Krita 打开图片，用深浅底检查真透明；裁去多余边缘、清理残色、统一画布。不要把棋盘格图片误认作透明 PNG。', '在两个工程替换角色和星星，保持玩法参数不变；建立素材来源表：文件名、来源、工具/模型、版本、许可链接与核查日期、修改说明、商用限制。'],
      cocos: '把清理后的 PNG 拖入 assets/art，展开资源取得 SpriteFrame 并赋给现有 Sprite。尺寸采用 CUSTOM，沿用原 UITransform；先替换一件并预览，再批量处理，避免新图原始像素尺寸改变碰撞。',
      unity: '贴图 Texture Type 设为 Sprite (2D and UI)，Sprite Mode 设 Single，Apply 后赋给原 SpriteRenderer。按实际尺寸统一 Pixels Per Unit；检查 Collider2D 或手工判定是否被换图意外改变。',
      acceptance: ['至少角色和奖励使用统一风格；在两种底色及实际尺寸下无白底、棋盘格和明显残边。', '每个使用的文件都有来源记录；无生成工具时明确标记占位素材，保留可执行提示词与后续替换清单。'],
      reflection: '为什么“工具允许商业使用”不等于图片中任何品牌或角色都可以被你用于商业游戏？',
    },
    {
      title: '做不会抖动的角色与反馈动画', goal: '完成稳定的精灵导入，并用两帧或缩放反馈让收集可被感知。',
      concept: '精灵表（Sprite Sheet）按固定网格保存动画帧。AI 不能保证帧间比例和位置相同，先生成候选图，再人工对齐；静态精灵加缩放同样可以完成有效反馈。像素风（Pixel Art）需要固定像素网格，不是把模糊图片缩小即可。',
      steps: ['将角色统一为 64×64 画布，底部中心作为视觉基准；准备正常与接取两个表情，难以保持一致时复制同一角色并修改眼睛或只做缩放。', '在 GIMP/Krita 用参考线对齐两帧，导出 128×64 横排 PNG；逐帧切换检查身体是否漂移，保留可编辑原文件。', '在两个引擎切分为两张精灵，接到星星显示反馈 0.12 秒再恢复；反馈只响应得分事件，不负责计算得分。', '对比 Point/Nearest（最近邻）与 Bilinear（双线性）过滤；本章扁平图选平滑过滤，像素风练习选最近邻并使用整数缩放，截取不同缩放倍率的效果。'],
      cocos: '导入标准网格资源可配置图集或分别导出两张同尺寸 PNG；确认 SpriteFrame 原始尺寸、裁切与 UITransform 锚点一致。用 Animation 或一次回调切换帧，重开取消旧回调；更换图片使用本章 SpriteSkin 示例。',
      unity: 'Sprite Mode 设 Multiple，在 Sprite Editor 按 64×64 网格 Slice，两帧采用相同 Pivot 与 Pixels Per Unit。可用 Animator 切换，或短计时后恢复 idleSprite；避免同时用两套系统写 SpriteRenderer.sprite。',
      acceptance: ['连续接取十颗星没有角色跳位；动画中断和重开后均恢复正常表情。', '能展示两种过滤效果并解释选择；图片边缘不会因切片取到邻帧像素。'],
      reflection: '生成图看起来很好，但动画一播放就抖动，你会依次核对哪三个基准？',
    },
    {
      title: '把背景、按钮和数字组成可读界面', goal: '完成统一的场景层次、分数显示和可用的开始/结算界面。',
      concept: '九宫格缩放（9-Slice）固定四角、拉伸中间，适合不同宽度按钮。视差（Parallax）通过不同层的移动比例制造深度；本章只做两层轻微移动，不让装饰抢走落下物的对比度。',
      steps: ['默认先用引擎纯色深青背景，无需下载或生成图片；可选用矩形、圆形程序绘制低对比山丘，再按背景模板生成替换图。需要视差时把远近图形分成两层，并与角色、掉落物、HUD 排序清楚。', '制作一个圆角按钮底图，把文字放到引擎文本组件；设置正常、按下、禁用三种状态，使用具有中文授权字体或系统可用字体。', '在图像编辑器量出四边不能被拉伸的像素区域，设置九宫格；分别测试短文案“开始”和长文案“再挑战一次”，边界厚度不变。', '测试 16:9、4:3 与窄窗口，确保倒计时和按钮可见；给分数增加短反馈，打开简化动态效果开关时停掉视差与闪烁。'],
      cocos: '在 Canvas 最底层的 Background 节点添加 Graphics，设置深青 fillColor，用 rect(-480, -270, 960, 540) 后调用 fill() 绘制背景；可另建节点用圆形画山丘。用节点顺序组织玩法和界面；按钮 Sprite 类型 SLICED，在 SpriteFrame 编辑器中设四边内边距（insetLeft/Right/Top/Bottom），UITransform 调整尺寸；Widget 保持 HUD 贴边。',
      unity: '将相机背景设为纯色深青；可选创建 2D Object → Sprites → Square/Circle 作为低对比山丘，放在玩法后方的 Sorting Layer。HUD 使用 Canvas；按钮 Image 设 Sliced，在 Sprite Editor 中设置 Border。Canvas Scaler 配合锚点适配；RectTransform 改大小不等同于缩放图片。',
      acceptance: ['两种按钮文案和三种窗口比例下，圆角、描边、数字都可读且可点击。', '关掉声音和动态效果仍能识别奖励、危险、剩余时间与结束状态。'],
      reflection: '哪些内容适合画进背景，哪些必须由引擎动态显示才能支持分数变化与本地化？',
    },
    {
      title: '让美术装得下，也跑得动', goal: '学会测量图片内存与绘制成本，完成一次有证据的优化。',
      concept: '资源预算（Asset Budget）限制美术成本。未压缩 RGBA 纹理约占宽×高×4 字节，512×512 约 1 MiB，完整 Mipmap（多级渐远纹理）还会增加内存；PNG 文件小不代表运行内存小。目标平台压缩支持不同，必须在实际构建里检查。',
      steps: ['为本章定学习预算：角色和掉落物最长边不超过 128 像素，背景不超过 1024，游戏美术原始导出总量不超过 2 MiB；记录每件图的尺寸、格式、文件与估算解码内存。', '把重复使用的小精灵加入图集并保留适当边缘留白；以最大缩放检查渗色，核实像素风是否禁用不必要的 Mipmap。', '制作一次优化前后对照：同屏 30 颗掉落物，录下帧耗时、纹理内存和绘制调用；采用目标平台支持的压缩格式，不为压小文件牺牲透明边缘。', '构建 Cocos Web 和 Unity 本机包，检查首次加载、重开十次与运行五分钟；只有实测改善才保留优化，并将超过预算但有理由的资源写入报告。'],
      cocos: '配置自动图集后以构建包为准验证，编辑器预览与构建打包可能不同；用引擎统计和浏览器性能工具记录目标设备上的数据。透明与不透明材质、遮罩或排序可能打断合批。',
      unity: '建立 Sprite Atlas 并检查打包预览，Platform Settings 按当前构建目标设置压缩；用 Profiler 与 Frame Debugger 定位实际批次，必要时关闭纹理 Read/Write，勿猜测 Switch 专有参数。',
      acceptance: ['有同条件的优化前后记录，能用计算解释至少一张纹理的内存成本。', '两个构建都无丢图或透明异常；五分钟后活动对象数和内存没有持续无界增长。'],
      reflection: '为什么把 2048×2048 PNG 压成更小文件，并不一定能减少运行时纹理内存？',
    },
    {
      title: '交付一个能玩、能换皮、能追溯的版本', goal: '将视觉工作流应用到完整小游戏，形成后续章节可复用的素材包。',
      concept: '可玩性（Playability）来自规则、反馈和选择。用自己命名与制作的资源实现熟悉的接物玩法；不要直接搬运现有游戏的角色、商标、音乐或关卡画面。商业化前要按发行平台要求重新核查素材权利与 AI 内容披露。',
      steps: ['加入危险物：默认下载工作台“紫莓小守卫” PNG，调整为偏红色调并加“!”标识；其轮廓与星星不同，不能只凭颜色区分。也可编辑 SVG 源文件改色，导出 PNG，或换成自己生成的危险晶体。每第五个掉落物为危险物，接到扣 10 分且最低为 0；连续接三颗星额外加 5 分，漏接或接危险物重置连击。把规则写在开始页。', '每 20 秒下落速度提高 15%，设置上限；调整生成位置，给玩家能左右取舍的空间。完成 60 秒结算，显示分数、最高连击和一次点击重开。', '请两位测试者各玩三局；无测试者时自己分三轮盲测并明确记录。观察规则理解、危险辨识和重开意愿，改进最明显的一项；分别演示占位版与最终版，同一规则不因换图失效。', '归档双引擎运行包、60 秒录像、素材源文件、提示词与来源许可表；列出生成工具使用情况、尚未替换的占位图及下一章复用计划。外部 AI 未实测的环节标为待验证。'],
      cocos: '把守卫 PNG 的 SpriteFrame 赋给危险物 Sprite，在检查器调整 Sprite.color 色调，并加带“!”的 Label 子节点。掉落物通过类型字段区分奖励和危险，共用一套移动和命中代码；颜色不参与规则判断。Web 包用 HTTP 服务运行，验证触摸、窗口变化和重开；广告 SDK 留到后续章节。',
      unity: '把守卫 Sprite 赋给危险物 SpriteRenderer，通过 SpriteRenderer.color 调整色调，再加 TextMeshPro 文字子对象显示“!”。颜色与原贴图相乘，想精确改色时先在免费图像编辑器中处理。复用同一掉落物组件，以类型字段决定规则；检查图集、字体与输入后交付当前操作系统运行包。',
      acceptance: ['两个版本都有 60 秒闭环、奖励/危险、连击、递进难度与重开，能够完整玩三局且无重复计分。', '提交运行证据、来源表和素材包；能从占位图替换为另一套美术，保持判定与得分正确。'],
      reflection: '下一款小游戏中，你能复用哪些资源规范与导入步骤？哪些许可和平台要求必须重新核查？',
    },
  ],
  code: {
    title: '换美术，不重写游戏规则',
    context: '仅演示两张精灵切换，不是完整游戏。Cocos 文件命名 SpriteSkin.ts，挂到已有 Sprite 节点；Unity 文件命名 SpriteSkin.cs，挂到已有 SpriteRenderer 对象。在检查器绑定 normal/collected 两张素材，计分事件调用 showCollected/ShowCollected(true)，反馈结束调用 false。统一图片尺寸、锚点和单位后再替换。',
    cocos: `import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property, requireComponent } = _decorator;
@ccclass('SpriteSkin')
@requireComponent(Sprite)
export class SpriteSkin extends Component {
  @property(SpriteFrame) normal: SpriteFrame | null = null;
  @property(SpriteFrame) collected: SpriteFrame | null = null;
  start() { this.showCollected(false); }
  showCollected(active: boolean) {
    const frame = active ? this.collected : this.normal;
    const sprite = this.getComponent(Sprite);
    if (sprite && frame) sprite.spriteFrame = frame;
  }
}`,
    unity: `using UnityEngine;
[RequireComponent(typeof(SpriteRenderer))]
public class SpriteSkin : MonoBehaviour {
  [SerializeField] private Sprite normal;
  [SerializeField] private Sprite collected;
  private SpriteRenderer view;
  void Awake() { view = GetComponent<SpriteRenderer>(); }
  void Start() { ShowCollected(false); }
  public void ShowCollected(bool active) {
    Sprite frame = active ? collected : normal;
    if (view != null && frame != null) view.sprite = frame;
  }
}`,
  },
  deliverables: ['两份 60 秒接星星小游戏：奖励、危险、连击、结算与重开齐全', '一套可复用素材与风格卡、提示词、透明/锚点检查记录、来源许可表', '占位版与美术版对照录像、性能记录和三轮试玩改进报告'],
  pitfalls: ['不要把带棋盘格的图片当作透明 PNG，也不要让模型生成游戏中的分数或按钮文字。', '逐帧生成不保证一致；先统一画布、视觉基准与导入设置，静态图加缩放是有效替代方案。', 'AI 输出并非自动无版权限制；保留许可证据，避开现有角色、标识和未经授权素材，发行前核查平台规则。'],
  quiz: [
    { question: '换角色图后画面变大、碰撞仍一样，优先检查什么？', options: ['计分函数是否换了名字', '显示尺寸、每单位像素数和锚点是否一致', '是否购买了更贵的 AI 工具'], answer: 1, explanation: '视觉大小受导入尺寸、UITransform 或 Pixels Per Unit 影响。应先统一视觉基准，再检查是否需要单独调整公平的判定范围。' },
    { question: '生成图片里有灰白棋盘格，应该怎么确认透明背景？', options: ['看起来像棋盘格就一定透明', '改成 JPG 保存即可', '在编辑器中放到两种底色上检查 Alpha，必要时去背后导出 PNG'], answer: 2, explanation: '真正透明区域会露出底色；画进图片的棋盘格不会。JPG 不支持透明通道。' },
  ],
  resources: [
    { label: 'Cocos · Sprite 组件与精灵帧', url: 'https://docs.cocos.com/creator/3.8/manual/zh/ui-system/components/editor/sprite.html', note: '查找 Sprite 显示模式、尺寸模式与九宫格；文档版本需对应编辑器。' },
    { label: 'Unity 6 · 二维精灵', url: 'https://docs.unity3d.com/6000.0/Documentation/Manual/sprite/sprite-landing.html', note: '查阅精灵导入、Sprite Editor 与图集，使用项目已安装的二维工具包。' },
    { label: 'GIMP · 官方使用手册', url: 'https://docs.gimp.org/3.0/zh_CN/', note: '免费图像编辑器；练习透明通道、图层、画布尺寸和 PNG 导出。' },
    { label: 'Krita · 官方手册', url: 'https://docs.krita.org/zh_CN/', note: '无需绘画基础也能用参考线和图层对齐帧；可替代 GIMP。' },
    { label: 'ComfyUI · 官方文档', url: 'https://docs.comfy.org/', note: '可选进阶资料，不是本章前提；模型许可、硬件需求和在线服务价格需分别核查。' },
    { label: 'Steamworks · 内容调查表', url: 'https://partner.steamgames.com/doc/gettingstarted/contentsurvey', note: '发行前查看当时有效的 AI 内容申报要求；保留所用素材与生成流程记录。' },
  ],
};
