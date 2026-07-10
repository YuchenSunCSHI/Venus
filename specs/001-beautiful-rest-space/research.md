# Research: 美好休息空间 MVP

## Decision: 采用 Tauri + React + TypeScript + Vite 作为 MVP 技术栈

**Rationale**: Venus 的第一目标是快速验证桌面级美感体验，核心风险在 UI 氛围、全屏休息空间、提醒节奏和音频体验，而不是复杂后端。Tauri + React + TypeScript + Vite 能用 Web 技术快速打磨漂亮界面，同时通过 Tauri 获得 Windows 桌面窗口、系统托盘、本地存储和未来跨平台潜力。Tauri 的运行时和包体通常比 Electron 更轻，适合“轻量个人空间”的产品感。

**Alternatives considered**:

- Electron + React: 生态成熟、桌面 API 丰富，但运行时成本、包体和内存占用更高，不符合轻量 MVP 的默认方向。
- .NET/WinUI: Windows 原生能力强，但 UI 快速试验、动效和后续跨平台潜力不如 Web UI 方案；对当前“漂亮体验优先”的验证目标不够敏捷。
- 纯 Web/PWA: 原型最快，但缺少稳定的系统托盘、全屏检测、桌面静默和本地壳能力，无法充分验证桌面级使用场景。

## Decision: Rust 侧只做桌面集成，产品逻辑保留在 TypeScript

**Rationale**: 休息节奏、会话状态、每日内容、音频状态和 UI 反馈需要高频迭代，并且可用 Vitest/React Testing Library 快速验证。Rust 侧保留为薄边界：全屏检测、系统托盘、窗口控制、本地文件读写、启动项或 shell 集成。这样可以避免双语言状态机，降低维护成本。

**Alternatives considered**:

- Rust 实现完整核心状态机：类型安全强，但 UI 与状态协同变慢，MVP 调整成本高。
- TypeScript 完全不依赖 Rust：无法满足全屏静默、系统托盘和本地桌面体验要求。

## Decision: 本地 JSON/key-value 存储偏好与每日内容元数据

**Rationale**: MVP 只需要保存 rest cadence、prompt enabled、audio preference、volume/intensity、temporary quiet mode 和最近一次每日内容状态。本地 JSON 或 Tauri store 足够透明、可迁移、易测试，不需要数据库、账户或远端同步。

**Alternatives considered**:

- SQLite: 适合复杂历史记录和查询，但当前 MVP 不做长期统计，过早引入会增加迁移和测试成本。
- 浏览器 localStorage: 容易实现，但跨 Tauri/系统集成边界不够明确，备份和迁移能力较弱。
- 云端存储: 与“不采集敏感工作内容、无需账户”的 MVP 约束冲突。

## Decision: 每日一景采用在线内容源 + 本地缓存 + 打包 fallback

**Rationale**: Venus 的美感体验不能长期依赖固定几项内置素材，否则很快失去新鲜感；但也不能在用户进入休息空间时把体验完全交给网络质量、随机 API 结果、授权缺失或限流。MVP 采用 provider 策略：有网络时从在线内容源获取候选视觉/音频内容，校验分辨率、主题、授权/来源说明和视听匹配后缓存为当日内容；离线、超时、限流或内容不合格时使用最近缓存或打包 fallback。`public/moments/fallback.json` 只承载少量可离线兜底内容，在线 provider 和缓存索引承载新鲜内容。

**Alternatives considered**:

- 纯内置素材: 最稳定、最易验收，但很快变成固定内容 demo，不能验证“持续美感注入”的产品价值。
- 休息开始时实时随机拉取在线 API: 新鲜感强，但授权、网络、限流、加载时间和视听匹配不可控，最容易破坏 2 秒进入休息空间预算。
- 用户自行选择图库: 增加配置负担，削弱每日一景的产品判断。

## Decision: 在线内容源必须通过可替换 provider 接口接入

**Rationale**: 高清图源和白噪音源的可用性、授权条款、API 速率限制和密钥策略都可能变化。MVP 不把某个第三方平台写死为产品核心，而是定义 `ContentProvider` 能力：获取候选内容、返回授权/来源元数据、声明主题标签、给出可缓存资源 URL 或下载结果。初始实现可使用公开可用且授权清晰的 provider；若 provider 需要私密 API key，则不得把密钥硬编码进桌面客户端，必须改为无密钥来源、用户自带 key 或后续服务端代理。

**Alternatives considered**:

- 直接依赖单一图源/音源 API: 原型快，但供应商变更、限流或授权变化会直接影响核心体验。
- 自建内容服务: 控制力强，但 MVP 阶段会把重点从桌面体验转移到后端运维。

## Decision: 测试策略按产品状态边界分层

**Rationale**: 节奏、会话、内容选择和音频状态是可纯函数化的核心逻辑，应由 unit tests 快速验证。偏好持久化、音频可用性和 Tauri IPC 需要 integration tests。休息空间视觉状态、prompt 交互和 fallback 需要 Playwright 或等价 UI checks。全屏检测和系统托盘受 OS 环境限制，必须保留手动验收。

**Alternatives considered**:

- 只做端到端测试: 覆盖用户路径但定位慢，难以验证 cadence edge cases。
- 只做单元测试: 无法证明全屏空间、音频反馈和 desktop shell 行为可用。

## Decision: 性能预算通过自动标记 + 手动桌面验收共同验证

**Rationale**: 2 秒休息空间/fallback、1 秒提示/音频反馈、全屏静默无可感知卡顿是产品预算。UI 可通过 performance marks、fake timer、Playwright timing 和 release 构建 smoke check 验证；全屏检测需用 Windows 实机录屏/秒表检查并记录配置。

**Alternatives considered**:

- 仅依赖主观体验: 不足以支撑宪法的显式性能预算。
- 过早引入复杂 profiling 基础设施: MVP 阶段成本高，先保留轻量测量点即可。