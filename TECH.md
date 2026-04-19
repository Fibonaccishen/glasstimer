# GlassTimer 技术文档

## 1. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      GlassTimer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   React UI  │◄──►│ State Mgmt  │◄──►│  Tauri IPC  │     │
│  │ Components  │    │ useReducer  │    │   Bridge    │     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘     │
│                                              │             │
│  ┌─────────────┐    ┌─────────────┐    ┌──────▼──────┐     │
│  │  Framer     │    │   CSS      │    │  Rust      │     │
│  │  Motion     │    │  Effects   │    │  Backend   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**渲染层**：WebView2 (Windows) / WebKit (macOS dev)
**逻辑层**：React + TypeScript
**通信层**：Tauri IPC (invoke/events)

---

## 2. 技术栈详解

### 2.1 Tauri v2

```json
// src-tauri/tauri.conf.json 关键配置
{
  "app": {
    "windows": [{
      "title": "GlassTimer",
      "width": 280,
      "height": 80,
      "resizable": false,
      "decorations": false,
      "transparent": true,
      "alwaysOnTop": true,
      "center": true
    }]
  }
}
```

**窗口策略**：
- `transparent: true` — 实现真正透明背景
- `decorations: false` — 无边框，支持自定义拖动
- `alwaysOnTop: true` — 置顶，不遮挡工作
- `resizable: false` — 固定尺寸，简化实现

### 2.2 React 18 + TypeScript

**状态管理 — useReducer**

```typescript
type TimerMode = 'idle' | 'expanded' | 'countdown';

interface State {
  mode: TimerMode;
  targetTime: number;      // 目标时间（毫秒）
  remainingTime: number;   // 剩余时间（毫秒）
  accentColor: string;     // 边缘光颜色
}

type Action =
  | { type: 'EXPAND' }
  | { type: 'COLLAPSE' }
  | { type: 'SELECT'; payload: number }  // 选择时长
  | { type: 'TICK'; delta: number }    // 每帧更新
  | { type: 'RESET' };
```

### 2.3 动画方案 — Framer Motion

**为什么用 Framer Motion 而非纯 CSS？**

| 能力 | Framer Motion | 纯 CSS |
|------|--------------|--------|
| Spring Physics | ✅ 原生支持 | 需自定义贝塞尔 |
| Layout Animations | ✅ 自动化 | 需手动计算 |
| Gesture handling | ✅ 拖拽支持 | 需事件监听 |
| Code-splitting | ✅ 按需加载 | - |

**核心动画组件**：

```tsx
// OptionPanel 液态展开
<motion.div
  animate={mode === 'expanded' ? 'expanded' : 'collapsed'}
  variants={variants}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>

// 数字跳动
<motion.span
  key={displayValue}
  initial={{ y: 8, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.15 }}
/>
```

### 2.4 CSS 玻璃效果

**核心样式变量**：

```css
:root {
  /* 玻璃 */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-bg-hover: rgba(255, 255, 255, 0.15);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-border-strong: rgba(255, 255, 255, 0.35);

  /* 模糊 */
  --blur-light: 12px;
  --blur-medium: 20px;
  --blur-heavy: 32px;

  /* 阴影 */
  --shadow-outer: 0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 1px 0 rgba(255, 255, 255, 0.1);

  /* 动画曲线 */
  --ease-liquid: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**玻璃容器**：

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-medium));
  -webkit-backdrop-filter: blur(var(--blur-medium));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-outer), var(--shadow-inner);
}

/* 流光叠加层 */
.glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
}
```

---

## 3. 组件设计

### 3.1 组件树

```
<App>
  └── <DraggableContainer>
        └── <GlassOrb mode={mode}>
              ├── <PlusIcon />              (mode: idle)
              ├── <OptionPanel />           (mode: expanded)
              └── <CountdownDisplay />      (mode: countdown)
```

### 3.2 GlassOrb

**职责**：作为所有状态的容器，处理拖拽

```typescript
interface GlassOrbProps {
  mode: TimerMode;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}
```

**拖拽实现**：

```typescript
// 使用 Tauri 的 window API 实现拖拽
import { getCurrentWindow } from '@tauri-apps/api/window';

const handleMouseDown = (e: React.MouseEvent) => {
  if (e.target === e.currentTarget) {
    getCurrentWindow().startDragging();
  }
};
```

### 3.3 OptionPanel

**职责**：展示三个时间选项

```typescript
interface TimeOption {
  label: string;   // "1min" | "10min" | "1h"
  value: number;   // 毫秒数
}

const options: TimeOption[] = [
  { label: '+1min', value: 60 * 1000 },
  { label: '+10min', value: 10 * 60 * 1000 },
  { label: '+1h', value: 60 * 60 * 1000 },
];
```

**入场动画（Stagger）**：

```tsx
const containerVariants = {
  visible: { transition: { staggerChildren: 50 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};
```

### 3.4 CountdownDisplay

**职责**：倒计时显示，自动单位切换

**显示逻辑**：

```typescript
function formatCountdown(ms: number): { value: string; unit: string } {
  const totalSeconds = Math.floor(ms / 1000);

  if (totalSeconds < 60) {
    return { value: totalSeconds.toString().padStart(2, '0'), unit: 's' };
  } else {
    const minutes = Math.floor(totalSeconds / 60);
    return { value: minutes.toString().padStart(2, '0'), unit: 'm' };
  }
}
```

**边缘光颜色计算**：

```typescript
function getAccentColor(ms: number): string {
  if (ms <= 0) return '#FFFFFF';
  if (ms < 10_000) return '#FF6B6B';      // < 10s 珊瑚红
  if (ms < 60_000) return '#FFD93D';      // < 1m 琥珀黄
  if (ms < 300_000) return '#6BCB77';    // < 5m 薄荷绿
  return 'rgba(255, 255, 255, 0.3)';     // 默认微光
}
```

---

## 4. Hooks

### 4.1 useTimer

```typescript
interface UseTimerReturn {
  remaining: number;      // 剩余毫秒
  isRunning: boolean;
  start: (ms: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

function useTimer(): UseTimerReturn;
```

**实现要点**：
- 使用 `useRef` 存储 `requestAnimationFrame` ID
- 使用 `useCallback` 缓存回调，避免重新创建
- 在 `requestAnimationFrame` 回调中更新状态

### 4.2 useClickOutside

```typescript
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
): void;
```

**用途**：点击选项面板外部时收起面板

---

## 5. 文件结构

```
glasstimer/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
│
├── src/
│   ├── main.tsx                 # React 入口
│   ├── App.tsx                  # 根组件
│   ├── App.css                  # 根样式
│   │
│   ├── components/
│   │   ├── GlassOrb.tsx         # 玻璃球容器
│   │   ├── GlassOrb.css
│   │   ├── OptionPanel.tsx       # 选项面板
│   │   ├── OptionPanel.css
│   │   ├── CountdownDisplay.tsx  # 倒计时显示
│   │   ├── CountdownDisplay.css
│   │   ├── TimeOption.tsx        # 单个选项
│   │   └── TimeOption.css
│   │
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   └── useClickOutside.ts
│   │
│   ├── styles/
│   │   ├── glass.css            # 玻璃效果变量
│   │   └── animations.css       # 动画关键帧
│   │
│   └── utils/
│       └── time.ts              # 时间格式化
│
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       └── main.rs              # Rust 入口
│
└── SPEC.md                      # 详细规格文档
```

---

## 6. 构建配置

### 6.1 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### 6.2 Tauri

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "devtools": true
  },
  "app": {
    "windows": [{
      "transparent": true,
      "decorations": false,
      "alwaysOnTop": true,
      "skipTaskbar": true
    }]
  }
}
```

---

## 7. 性能优化

### 7.1 GPU 加速

```css
/* 确保动画元素开启 GPU 加速 */
.glass {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 数字跳动也需 GPU 加速 */
.digit {
  will-change: transform;
  display: inline-block;
}
```

### 7.2 避免重排重绘

- 动画属性仅使用 `transform` 和 `opacity`
- 时间格式化使用 `useMemo` 缓存
- 避免在动画过程中触发 React 重新渲染

### 7.3 内存优化

- 使用 `useCallback` 避免回调函数重复创建
- 使用 `useRef` 存储 RAF ID，避免闭包问题
- 及时 `cancelAnimationFrame`

---

## 8. 已知限制

| 限制 | 说明 | 解决方案 |
|------|------|----------|
| WebView2 字体 | Windows 端可能缺少 SF Pro | 回退到 system-ui |
| 透明窗口拖拽 | 透明区域不可拖拽 | 限定拖拽区域为玻璃球 |
| 多屏支持 | 多屏时窗口位置 | 存储上次位置到 localStorage |

---

## 9. 开发命令

```bash
# 开发模式
npm run tauri dev

# 生产构建
npm run tauri build

# 仅前端开发（无 Tauri）
npm run dev
```

---

*Version 1.0 | 2026-04-18*
