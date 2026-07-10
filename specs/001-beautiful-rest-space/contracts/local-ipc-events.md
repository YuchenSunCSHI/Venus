# Contracts: 本地 IPC、内容源与事件契约

Venus MVP 不提供公共 SDK，也不上传工作内容。契约重点是 Web UI 与 Tauri/Rust 桌面集成层之间的本地 IPC、在线内容 provider 的最小返回形态，以及 TypeScript 内部可订阅事件。所有本地契约默认仅在本机进程内使用，不传输工作内容、窗口标题、会议内容或敏感文本。在线内容请求只发送内容主题、日期和质量约束，不发送用户工作上下文。

## Tauri Commands

### `preferences.load`

**Caller**: TypeScript UI

**Returns**:

```ts
type LoadPreferencesResult = {
  schemaVersion: number;
  cadence: {
    workDurationMinutes: number;
    restDurationMinutes: number;
    postponeMinutes: number;
    promptsEnabled: boolean;
    temporaryQuietUntil?: string;
    suggestionMode: 'fixed' | 'suggested';
  };
  audioEnabledByDefault: boolean;
  lastVolume: number;
  quietMode: 'off' | 'untilNextInterval' | 'untilTime';
};
```

**Rules**:

- 读取失败时返回默认偏好，并附带可诊断日志；不得阻塞主界面。
- 不返回敏感工作内容。

### `preferences.save`

**Caller**: TypeScript UI

**Input**: `LoadPreferencesResult`

**Returns**:

```ts
type SavePreferencesResult = {
  ok: boolean;
  persistedAt?: string;
  recoverableError?: 'write_failed' | 'schema_invalid';
};
```

**Rules**:

- 输入必须按 schema 校验。
- 写入失败时 UI 保持当前会话可用，并用克制状态提示。

### `window.enterRestFullscreen`

**Caller**: TypeScript UI

**Input**:

```ts
type EnterRestFullscreenInput = {
  sessionId: string;
  displayMode: 'primaryDisplay' | 'currentDisplay';
};
```

**Returns**:

```ts
type EnterRestFullscreenResult = {
  ok: boolean;
  enteredAt?: string;
  recoverableError?: 'window_unavailable' | 'permission_denied';
};
```

**Rules**:

- 成功后休息空间必须在 2 秒内显示 daily moment 或 fallback。
- 失败时回落到沉浸窗口状态，避免空白或崩溃。

### `window.exitRestFullscreen`

**Caller**: TypeScript UI

**Input**:

```ts
type ExitRestFullscreenInput = {
  sessionId: string;
  reason: 'completed' | 'endedEarly' | 'skipped' | 'appClosing';
};
```

**Returns**:

```ts
type ExitRestFullscreenResult = {
  ok: boolean;
  exitedAt?: string;
};
```

**Rules**:

- 调用前或调用过程中必须停止/淡出音频。
- 返回工作状态不得残留遮挡窗口。

### `desktop.getQuietContext`

**Caller**: TypeScript cadence scheduler

**Returns**:

```ts
type QuietContext = {
  shouldSuppressPrompt: boolean;
  reason?: 'fullscreenDetected' | 'temporaryQuiet' | 'promptsDisabled';
  checkedAt: string;
};
```

**Rules**:

- 检查必须轻量，不能造成可感知卡顿。
- 不返回前台应用标题、会议名称、文档名或其他敏感内容。

### `content.cacheAsset`

**Caller**: TypeScript content provider

**Input**:

```ts
type CacheAssetInput = {
  assetType: 'visual' | 'audio';
  sourceProvider: string;
  providerAssetId?: string;
  remoteUrl: string;
  licenseNote: string;
  attribution?: string;
  expectedTheme: string;
};
```

**Returns**:

```ts
type CacheAssetResult = {
  ok: boolean;
  localPath?: string;
  cachedAt?: string;
  recoverableError?: 'network_failed' | 'download_failed' | 'license_missing' | 'unsupported_format' | 'write_failed';
};
```

**Rules**:

- 不缓存缺少授权说明的在线资源。
- 下载失败、格式不支持或写入失败时，UI 必须可以继续使用缓存或 bundled fallback。
- 不把 provider token、用户工作内容或窗口信息写入缓存元数据。

## Online Content Provider Contract

在线 provider 由 TypeScript 侧适配，不把具体第三方写死到产品状态机。provider 可以来自公开 API、可替换 manifest、用户配置的来源或后续服务端代理。

```ts
type ContentProviderQuery = {
  dateKey: string;
  desiredThemes: Array<'forest' | 'coast' | 'mountain' | 'rain' | 'sky' | 'abstractCalm'>;
  minVisualWidth: number;
  minVisualHeight: number;
  audioRequired: boolean;
};

type ContentProviderCandidate = {
  provider: string;
  providerAssetId?: string;
  visual: {
    remoteUrl: string;
    width?: number;
    height?: number;
    theme: string;
    licenseNote: string;
    attribution?: string;
  };
  audio?: {
    remoteUrl: string;
    soundType: 'rain' | 'forest' | 'waves' | 'wind' | 'stream';
    matchedVisualThemes: string[];
    licenseNote: string;
    attribution?: string;
  };
};
```

**Rules**:

- provider 不得要求把私密 API key 硬编码进桌面客户端。
- candidate 缺少 `licenseNote` 时必须被拒绝。
- visual 与 audio 主题不匹配时不得作为默认每日内容组合。
- provider 超时、限流或返回空结果时必须进入缓存或 bundled fallback 路径。

## Tauri Events

### `desktop://quiet-context-changed`

```ts
type QuietContextChangedEvent = {
  shouldSuppressPrompt: boolean;
  reason?: 'fullscreenDetected' | 'temporaryQuiet' | 'promptsDisabled';
  emittedAt: string;
};
```

**Consumer**: cadence scheduler、prompt controller。

**Expected Behavior**: 若到达提醒时间但 `shouldSuppressPrompt = true`，会话进入 `quietSuppressed`，不得显示 prompt。

### `desktop://tray-action`

```ts
type TrayActionEvent = {
  action: 'openApp' | 'startRest' | 'pausePrompts' | 'resumePrompts' | 'quit';
  emittedAt: string;
};
```

**Consumer**: app shell。

**Expected Behavior**: 系统托盘动作只触发明确用户意图，不自动开始声音播放。

## TypeScript Domain Events

### `rest.promptDue`

```ts
type RestPromptDue = {
  sessionId: string;
  cadenceSnapshot: {
    workDurationMinutes: number;
    restDurationMinutes: number;
  };
  dueAt: string;
};
```

### `rest.sessionStateChanged`

```ts
type RestSessionStateChanged = {
  sessionId: string;
  from: string;
  to: string;
  reason?: string;
  changedAt: string;
};
```

### `audio.playbackStateChanged`

```ts
type AudioPlaybackStateChanged = {
  audioId?: string;
  from: 'off' | 'loading' | 'playing' | 'muted' | 'unavailable' | 'fadingOut';
  to: 'off' | 'loading' | 'playing' | 'muted' | 'unavailable' | 'fadingOut';
  volume: number;
  changedAt: string;
};
```

## Contract Tests

- `preferences.load` 在文件不存在、损坏、旧 schema 时返回默认可用偏好。
- `preferences.save` 拒绝无效 cadence，并保持当前 UI 状态不崩溃。
- `desktop.getQuietContext` 不包含敏感文本字段。
- `content.cacheAsset` 拒绝缺少授权信息的在线资源，并返回可恢复错误。
- `window.enterRestFullscreen` 失败时 UI 进入 fallback immersive window，而不是空白。
- `window.exitRestFullscreen` 后 audio state 必须为 `off` 或 `fadingOut -> off`。
- 在线 provider 失败、超时、限流或返回不匹配候选时，daily moment 选择进入缓存或 bundled fallback。