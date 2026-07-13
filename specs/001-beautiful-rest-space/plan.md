# Implementation Plan: 美好休息空间 MVP

**Branch**: `001-beautiful-rest-space` | **Date**: 2026-07-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-beautiful-rest-space/spec.md`

## Summary

Venus MVP 将做成 Windows-first 的轻量桌面应用：用户在默认 50 分钟工作后收到温和提醒，可接受、稍后、跳过，并在接受后进入全屏沉浸式休息空间，看到每日一景和可选的匹配环境声。内容策略采用“在线内容源 + 本地缓存 + 打包 fallback”：有网络时获取合法可用的高清视觉与环境声候选，校验质量、授权和视听匹配后缓存；离线、限流、加载慢或内容不合格时立即使用本地 fallback。技术方案采用 Tauri + React + TypeScript + Vite：用 Web UI 快速打磨漂亮体验，用 Tauri 保持较轻的桌面壳和本地能力；Rust 侧仅承担全屏检测、系统托盘、窗口控制、文件/偏好存储等桌面集成，产品状态、节奏、内容编排和音频控制优先保留在 TypeScript 中，便于快速迭代和未来扩展。

## Technical Context

**Language/Version**: TypeScript 5.x、React 18/19 兼容写法、Rust stable 1.8x、Tauri 2.x、Vite 5/6。

**Primary Dependencies**: Tauri、React、Vite、TypeScript；UI 动效与状态优先用 CSS/React 原生能力；测试使用 Vitest、React Testing Library、Playwright；Rust 侧使用 Tauri 官方插件或薄封装处理系统托盘、窗口、Shell/OS 集成。

**Storage**: 本地优先。用户偏好、节奏设置、提示开关、音频偏好、最近一次每日内容元数据、在线内容缓存索引和 fallback manifest 存入 Tauri app data 目录中的 JSON 或轻量 key-value store；MVP 不引入远端账户或数据库。

**Testing**: Vitest 覆盖节奏、休息会话状态机、每日内容选择和音频状态；React Testing Library 覆盖组件状态和偏好集成；Playwright 覆盖桌面 WebView UI 状态；Rust 侧用 cargo test 覆盖 IPC 参数校验和可纯函数化的桌面集成逻辑。全屏检测和系统托盘行为保留手动验证路径。

**Target Platform**: Windows 10/11 桌面优先；Tauri 架构保留 macOS/Linux 后续扩展可能，但 MVP 验收以 Windows 为准。

**Project Type**: desktop-app，单仓库应用。

**Performance Goals**: 休息空间或美感 fallback 在正常桌面环境 2 秒内可见；提醒交互、音频开始/静音/停止反馈 1 秒内可感知；全屏静默检测不造成可感知卡顿；休息空间保持 60fps 目标，图片呼吸动效仅使用 compositor 友好的 opacity/transform，避免明显闪烁、音频突变和退出后残留。

**Constraints**: MVP 不采集或暴露敏感工作内容；不把产品语言医疗化或绩效化；默认无需账户、团队、健康统计；在线内容源不得依赖会暴露在客户端中的私密 API key；内容素材必须合法可用、记录来源/授权并可离线 fallback；Rust 侧保持薄集成层，避免把产品逻辑分散到双语言实现。

**Scale/Scope**: 一个个人桌面应用 MVP；核心流程包含初次进入、工作间隔、提醒 pending、稍后、跳过、全屏静默、在线内容准备、缓存命中、休息 active、加载/失败 fallback、音频不可用、完成/提前结束。初始内容规模为每日一景、在线候选内容缓存和少量内置 fallback，不做内容库、推荐系统、多用户同步或云端账户。

## Constitution Check

*GATE: PASS before Phase 0 research. Re-check after Phase 1 design: PASS.*

- **Code Quality**: 采用清晰边界：TypeScript 管理产品状态与 UI，Rust/Tauri 只提供桌面能力命令和事件。新增抽象仅限 `cadence`、`session`、`content`、`audio`、`preferences`、`desktop-integration` 六类稳定边界，分别对应 spec 的核心实体和可测行为。
- **Testing Evidence**: 计划为节奏/会话逻辑添加 unit tests，为偏好持久化、内容 provider、缓存/fallback 与音频状态添加 integration tests，为休息空间状态添加 Playwright UI checks。OS 级全屏检测、系统托盘和真实在线内容源在自动化受限时采用 quickstart 中的手动验收路径，并记录实际 Windows 版本、显示器配置和网络状态。
- **Chinese Documentation**: 本计划、[research.md](research.md)、[data-model.md](data-model.md)、[quickstart.md](quickstart.md) 和 [contracts/local-ipc-events.md](contracts/local-ipc-events.md) 均使用中文。quickstart 包含 Mermaid 状态流，用于内部共享休息流程、在线内容获取、缓存和 fallback 路径。
- **Maintainability**: 模块边界按产品能力划分，跨语言边界只通过显式 IPC/事件契约传递，不让 Rust 与 TypeScript 同时实现同一状态机。内容源通过 provider 接口隔离，在线 provider、缓存 provider、本地 fallback provider 可替换。放弃 Electron 的原因是包体和运行时成本更高；放弃 .NET/WinUI 的原因是 Web 品质 UI 快速迭代和跨平台潜力较弱。
- **Performance Budget**: 2 秒休息空间/fallback、1 秒提示与音频反馈、全屏检测无可感知卡顿为硬预算。验证方式包括 Playwright 性能标记、Vitest fake timer、手动秒表/录屏检查、Tauri 开发构建和 release 构建对比。
- **UX Consistency**: 桌面优先，语言保持轻、静、美和个人化；核心控件最少化，必须包含快速退出、静音/音量入口；覆盖默认、加载、空、错误、成功、禁用、恢复状态；常见桌面窗口尺寸和全屏状态下文案/控制项不得遮挡关键视觉内容。视觉动效以图片呼吸感和 crossfade 为主，不引入雨、雪、粒子或 shader 等程序化自然层，除非后续验证静态呼吸仍不足。

## Project Structure

### Documentation (this feature)

```text
specs/001-beautiful-rest-space/
├── plan.md
├── design-direction.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── local-ipc-events.md
└── tasks.md              # /speckit.tasks 阶段生成
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx
│   └── styles/
├── features/
│   └── rest-space/
│       ├── components/
│       ├── cadence/
│       ├── session/
│       ├── content/
│       ├── audio/
│       ├── preferences/
│       ├── shared/
│       └── desktop/
├── shared/
│   ├── ui/
│   ├── events/
│   ├── time/
│   └── performance/
└── test/
    ├── unit/
    ├── integration/
    └── e2e/

src-tauri/
├── src/
│   ├── main.rs
│   ├── commands.rs
│   ├── fullscreen.rs
│   ├── window.rs
│   ├── content_cache.rs
│   ├── preferences.rs
│   └── tray.rs
├── capabilities/
└── tauri.conf.json

public/
└── moments/
    ├── fallback.json
    ├── images/
    └── audio/

docs/
├── content-sources.md
└── ux-language.md
```

**Structure Decision**: 选择 Tauri 单应用结构。`src/` 承载 Web UI、产品状态、休息节奏、在线内容 provider、内容选择、音频匹配与体验；`src-tauri/` 承载 Windows 桌面集成、系统托盘、全屏检测、窗口控制、本地文件访问和缓存读写；`public/moments/` 存放 MVP 打包 fallback 素材元数据。该结构支持快速原型、桌面原生能力、在线内容可替换和未来跨平台扩展，同时避免在 Rust 与 TypeScript 中重复实现业务状态机。

## Phase 0 Research

见 [research.md](research.md)。已解决技术栈、桌面集成边界、偏好存储、测试策略、内容 fallback 和性能预算验证方式。

## Phase 1 Design

见 [design-direction.md](design-direction.md)、[data-model.md](data-model.md)、[contracts/local-ipc-events.md](contracts/local-ipc-events.md) 和 [quickstart.md](quickstart.md)。设计产物覆盖视觉方向、交互原则、核心实体、状态流转、本地 IPC/事件契约和端到端验证指南。

## Complexity Tracking

无宪法违规。当前复杂度来自桌面壳 + Web UI 的必要边界；已通过“Rust 只做桌面集成、TypeScript 保留产品逻辑”的约束控制复杂度。
