# GlassTimer PRD - 极简玻璃倒计时

## 1. Concept & Vision

一款追求极致体验的桌面倒计时工具。它栖身于桌面一角，外表是一枚泛着流光的玻璃圆点，轻触即绽放出时间选择，静默计时，优雅至极。

**核心理念**：
- **极致简洁**：一眼一触，即掌时间
- **极致流畅**：每一次变形、每一帧跳动，皆为享受
- **极致轻便**：弹指之间，随叫随到

---

## 2. Design Language

### 2.1 Aesthetic Direction - "液态玻璃"

灵感源自 Apple visionOS 和 iOS 7 时代的玻璃拟态，但更强调**流光溢彩**与**液态质感**。不是冰冷的毛玻璃，而是一滴悬垂的露珠，边缘泛着柔和的光晕。

### 2.2 Color Palette

```
主色调：
├── 玻璃底色      rgba(255, 255, 255, 0.08)
├── 玻璃边框      rgba(255, 255, 255, 0.18)
├── 高光          rgba(255, 255, 255, 0.5)
└── 阴影          rgba(0, 0, 0, 0.2)

交互色：
├── 默认          rgba(255, 255, 255, 0.12)
├── 悬停          rgba(255, 255, 255, 0.18)
└── 按下          rgba(255, 255, 255, 0.08)

功能色（倒计时进行时边缘微光）：
├── < 10s        #FF6B6B (珊瑚红，温热警示)
├── < 60s        #FFD93D (琥珀黄)
└── ≥ 60s        #6BCB77 (薄荷绿)
```

### 2.3 Typography

```
字体：SF Pro Display → SF Mono → system-ui → -apple-system
计时数字：SF Mono (等宽，字形利落)
字号策略：
├── 初始圆点内的 "+"    24px
├── 选项按钮            14px, medium
├── 倒计时数字          32px, tabular-nums
└── 倒计时单位标注       12px
```

### 2.4 Spatial System

```
基础单位：4px

圆点尺寸：
├── 初始态（仅+号）      56px × 56px
├── 展开态（选项面板）    280px × 56px
└── 倒计时态            72px × 72px

圆角：
├── 按钮/圆点           28px (全圆)
└── 选项面板            28px (统一高度)

间距：
├── 选项间距            12px
└── 面板内边距          12px
```

### 2.5 Motion Philosophy

**"液态"意味着流动、连贯、无割裂感。**

```
核心原则：
1. 所有状态转换必须连贯，不能有跳变
2. 变形时使用 spring physics（弹性物理）
3. 时长控制：
   ├── 微交互（hover/press）    120-180ms
   ├── 状态展开/收缩            400-600ms
   ├── 数字跳动                 150ms (每格单独动画)
   └── 警示闪烁                 800ms ease-in-out
```

**关键动画曲线**：
```css
--ease-liquid: cubic-bezier(0.34, 1.56, 0.64, 1);   /* 弹性涌现 */
--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);       /* 流畅减速 */
--ease-gentle: cubic-bezier(0.4, 0, 0.2, 1);       /* 温和过渡 */
```

### 2.6 Visual Assets

- **图标**：无外部依赖，使用 CSS + SVG 绘制 "+" 号
- **装饰**：三层高光叠加（顶部横条、内阴影、外发光）
- **无图片**：所有效果纯代码实现

---

## 3. Layout & Structure

### 3.1 三种状态

```
┌─────────────────────────────────────────────────┐
│                                                 │
│    状态1: 初始态                                 │
│    ┌───────┐                                    │
│    │       │  一枚悬垂的玻璃小球                  │
│    │   +   │  静静等待轻触                        │
│    │       │                                    │
│    └───────┘                                    │
│                                                 │
│    状态2: 选择态                                 │
│    ┌─────────────────────────┐                   │
│    │ +1min │ +10min │ +1h   │  玻璃面板温柔展开   │
│    └─────────────────────────┘                   │
│                                                 │
│    状态3: 倒计时态                               │
│    ┌─────────┐                                  │
│    │   05    │  静默流逝，只显两位数字             │
│    │   m    │  边缘微光，色泽随时间变化            │
│    └─────────┘                                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2 状态流转

```
[初始] --点击--> [展开] --选择--> [倒计时] --结束--> [初始]
   ^                                    │
   |___________点击空白区域重新展开______|
```

### 3.3 响应策略

- **固定尺寸**：不响应窗口缩放，始终保持最佳尺寸
- **置顶窗口**：不影响其他应用
- **可拖拽**：按住圆点可拖动到屏幕任意位置

---

## 4. Features & Interactions

### 4.1 核心功能

| 功能 | 行为 |
|------|------|
| 唤起选项 | 点击圆点 → 液态展开面板 |
| 选择时长 | 点击选项 → 面板收缩 → 进入倒计时 |
| 取消操作 | 点击选项面板外任意区域 → 收缩回圆点 |
| 查看进度 | 倒计时中显示剩余时间（自动单位切换） |
| 终止计时 | 点击计时中的圆点 → 停止 → 回到初始态 |

### 4.2 交互细节

**初始圆点 → 悬停**
```
表现：
- 轻微上浮 (translateY: -4px)
- 边框亮度增加
- 内部高光增强

时长：180ms, ease-liquid
```

**初始圆点 → 按下**
```
表现：
- 轻微下沉 (translateY: 0)
- 缩放 0.95

时长：120ms, ease-smooth
```

**展开动画（核心液态效果）**
```
从一颗圆 → 展开为横条

关键技术：
1. clip-path 液态变形（非简单width展开）
2. Spring physics 弹性边界
3. 内部选项依次入场（stagger 50ms）

时长：500ms, ease-liquid
```

**选项按钮 → 悬停**
```
表现：
- 背景色变亮
- 文字微微放大 (scale 1.05)

时长：150ms
```

**倒计时数字变化**
```
每一秒变化时：
- 数字先向上微移 + 淡出
- 新数字从下方入场
- 使用 transform 而非opacity变化（GPU加速）

时长：150ms/位
```

### 4.3 倒计时色彩随时间变化

```
≥ 10 分钟     无色边缘微光（平静）
5-10 分钟    边缘泛薄荷绿
1-5 分钟     边缘转琥珀黄
< 1 分钟     边缘转珊瑚红
< 10 秒      边缘呼吸闪烁（pulse animation）
0 秒         轻微震动 + 边缘爆发闪光
```

### 4.4 边界条件

| 场景 | 处理 |
|------|------|
| 计时结束 | 显示 "Done!" 2秒 → 自动回到初始态 |
| 快速连点 | 防抖 300ms，忽略重复点击 |
| 系统休眠 | 暂停计时，系统唤醒后继续（可选） |
| 多实例 | 仅允许单实例运行 |

---

## 5. Component Inventory

### 5.1 GlassOrb（玻璃球）

**视觉规范**：
- 直径 56px，border-radius: 50%
- background: var(--glass-bg)
- backdrop-filter: blur(20px)
- border: 1px solid var(--glass-border)
- box-shadow:
  - 0 8px 32px rgba(0,0,0,0.25) 外阴影
  - inset 0 1px 0 rgba(255,255,255,0.1) 内高光
  - 0 0 0 1px rgba(255,255,255,0.05) 内描边

**状态**：
- default：静止，边缘柔和
- hover：上浮 4px，边缘增亮
- active：下沉，缩放 0.95
- expanding：变形展开中（clip-path 动画）

### 5.2 OptionPanel（选项面板）

**视觉规范**：
- 高度 56px（与初始圆点同高）
- border-radius: 28px
- 三等分选项，每格 80px 宽
- 选项间隔 12px
- glass effect 与圆点一致

**状态**：
- hidden：scaleX(0)，opacity 0
- visible：scaleX(1)，opacity 1
- 选项：各自 opacity + translateY 依次入场

### 5.3 CountdownDisplay（倒计时显示）

**视觉规范**：
- 尺寸 72px × 72px（略大于初始态）
- 数字 32px SF Mono tabular-nums
- 单位标注 12px 在数字右下方
- 边缘光颜色随时间动态变化

**状态**：
- counting：正常倒计时
- warning：< 1 分钟，边缘变色
- critical：< 10 秒，边缘闪烁
- done：显示 "Done!" + 闪光

### 5.4 TimeOption（时间选项按钮）

**规格**：
- 宽度 80px，高度 40px
- 文字 14px medium
- border-radius: 20px（内部圆角）

**状态**：
- default：透明底，亮色字
- hover：半透明底，字放大
- active：底更暗

---

## 6. Technical Approach

### 6.1 技术栈

```
框架：       Tauri v2
前端：       React 18 + TypeScript
构建：       Vite
动画：       Framer Motion + CSS
状态管理：   React useState/useReducer（简单够用）
```

### 6.2 为什么用 Tauri

| 维度 | Tauri | Electron |
|------|-------|----------|
| 内存占用 | ~10MB | ~150MB |
| 冷启动 | < 500ms | ~2s |
| 运行时 | WebView2 | Chromium + Node |
| 玻璃效果 | 完美支持 | 完美支持 |

Tauri 轻量小巧，与产品调性完美契合。

### 6.3 项目结构

```
glasstimer/
├── src/
│   ├── components/
│   │   ├── GlassOrb.tsx        # 玻璃球组件
│   │   ├── OptionPanel.tsx      # 选项面板
│   │   ├── CountdownDisplay.tsx # 倒计时显示
│   │   └── TimeOption.tsx       # 时间选项
│   ├── hooks/
│   │   ├── useTimer.ts          # 倒计时逻辑
│   │   └── useClickOutside.ts   # 点击外部关闭
│   ├── styles/
│   │   ├── glass.css            # 玻璃效果变量
│   │   └── animations.css       # 动画定义
│   ├── utils/
│   │   └── time.ts              # 时间格式化
│   └── App.tsx
├── src-tauri/
│   └── tauri.conf.json          # 窗口配置
└── package.json
```

### 6.4 关键实现

**液态展开（Framer Motion）**：
```tsx
const variants = {
  collapsed: { width: 56, borderRadius: 28 },
  expanded: { width: 280, borderRadius: 28 }
};
```

**计时器（requestAnimationFrame）**：
```tsx
useAnimationFrame((delta) => {
  if (running) setTime(t => t - delta);
}, running);
```

**GPU 加速**：
```css
.will-change-transform { will-change: transform; }
.backdrop-glass { backface-visibility: hidden; }
```

### 6.5 性能目标

| 指标 | 目标 |
|------|------|
| 冷启动 | < 500ms |
| 动画帧率 | 稳定 60fps |
| 内存占用 | < 50MB |
| 包体积 | < 5MB |
| 点击响应 | < 16ms |

---

## 7. Q&A / 已知决策

**Q: 为什么不支持正计时？**
A: 极简至上，倒计时已覆盖 90% 使用场景（泡面、专注、会议）

**Q: 为什么只有三个时间选项？**
A: 极致简洁，1分钟/10分钟/1小时覆盖最常用场景，够用即美

**Q: 如何实现窗体无边框但可拖动？**
A: Tauri 配置 `decorations: false`，圆点区域监听 mouseDown 实现拖动

**Q: 是否支持快捷键？**
A: 首版不支持，保持简洁。未来可考虑全局快捷键唤起

---

*Version 1.0 | 2026-04-18*
