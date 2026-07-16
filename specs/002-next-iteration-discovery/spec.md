# Feature Specification: Venus 下一轮迭代候选需求

**Feature Branch**: `未创建 - 当前为需求取舍草案`

**Created**: 2026-07-14

**Status**: Draft - Grill-me Decisions Captured

**Input**: User description: "当前 MVP 已完成，希望在此基础上进行下一轮迭代。先参考同类产品实现，罗列可选需求，由用户取舍；可以创建一个新的 Spec。"

**Design Direction**: [design-direction.md](design-direction.md)

## 同类产品参考

本节只提炼公开产品能力，不复制具体实现或文案。Venus 下一轮仍应避免变成医疗化、打卡式或效率焦虑产品。

| 产品 | 可参考能力 | 对 Venus 的启发 |
| --- | --- | --- |
| Time Out | 普通休息 + micro break、可配置休息类型、break theme、休息前/中/后动作、轻量活动记录 | Venus 可考虑“微休息”和“休息阶段动作”，但应保持克制，不做复杂自动化面板 |
| BreakTimer | 休息频率与时长配置、工作时间、提前通知、跳过/稍后、自定义颜色和消息 | Venus 可补齐工作时间、提醒前预告和节奏配置，这是桌面工具的基础成熟度 |
| Stretchly | 跨平台休息提醒、minibreak/long break、开源可配置 | Venus 可借鉴分层休息节奏，但重点应放在体验质量而非配置数量 |
| Noisli | 多种环境声混合、预设 playlist、timer、不同场景如 focus/relax/sleep | Venus 可扩展声音主题、收藏组合和场景预设，但不应把休息空间变成声音调音台 |
| Endel | 自适应 soundscape、按时间/环境/状态变化、Focus/Relax/Sleep 场景、桌面端低干扰界面 | Venus 可探索“时间感知”和“自动选择场景”，但 MVP 后第一轮不宜引入生理数据或强功效宣称 |

## 取舍原则

- 优先增强 MVP 的日常可用性，而不是扩张成完整健康管理产品。
- 优先选择本地优先、隐私边界清晰、无需账号即可验证的能力。
- 所有新增能力必须继续服务“轻、静、美的个人休息空间”。
- 不以“效率提升”“健康风险”“连续打卡”作为核心驱动力。
- 每个用户故事必须能独立交付、独立验证、独立回滚。

## 已确认产品决策

### 提前预告与心流保护

- 提前预告不是“小号 prompt”，而是纯视觉的环境信号。
- 默认效果为主屏右下角边缘弧光，呈现低亮度呼吸感。
- 弧光本体永远不带文字；弧光含义放入首次引导说明。
- 弧光无声音、无系统通知、无任务栏闪烁、无托盘气泡、不抢焦点。
- 弧光默认提前完整休息 2 分钟出现，持续 6-8 秒，只出现一次。
- 用户处于持续键盘或鼠标输入时，既不显示弧光，也不显示正式休息 prompt。
- 休息提醒在持续工作时进入 pending 状态，向后顺延到持续输入结束后。
- 第一版 ActiveFlow 判断只基于本机键盘/鼠标输入节奏，不读取窗口标题、应用名、屏幕内容、会议内容或文档正文。
- 第一版 ActiveFlow 使用最近输入时间判断：最近 10 秒内有键盘或鼠标输入即视为 active。
- 第一版 QuietWindow 定义为连续 10 秒没有键盘或鼠标输入。
- ActiveFlow 阈值不暴露给用户配置。
- 用户停下后先显示右下角边缘弧光；如果 30 秒内仍保持安静，再显示正式 prompt。
- 弧光 hover、focus 或 click 后可展开轻浮层，显示“休息快到了”与“稍后”“跳过”操作。
- 预告展开层不提供“开始休息”；“开始休息”只出现在正式 prompt。
- 全屏、演示或 reduced motion 场景下必须静默或降级。

### 设置窗口与首次引导

- 托盘右键菜单只提供“设置...”入口，不直接承载复杂配置。
- 点击“设置...”打开独立设置窗口；窗口关闭不退出 Venus。
- 如果设置窗口已打开，再次点击托盘入口应聚焦已有窗口。
- 设置采用即时保存策略，不提供统一保存按钮。
- 设置窗口必须提供恢复默认能力。
- 首次引导与设置窗口共用同一份偏好模型，但首次引导只展示最少步骤。
- 首次引导只包含 3 步：休息节奏、内容偏好、弧光提醒说明。
- 首次引导中工作时间默认不限制，但提供“工作日 09:00-18:00”和自定义入口作为建议。
- 工作时间只有在用户显式设置后才用于静默自动提醒；托盘“开始休息”始终可用。
- 休息节奏预设为 25+5、50+10、75+10，并支持用户自定义。
- 默认节奏继续使用 50 分钟工作 + 10 分钟休息。
- 自定义工作间隔建议限制在 15-120 分钟；自定义休息时长建议限制在 1-30 分钟。
- 完整配置放入独立设置窗口，包含休息节奏、提醒方式、内容偏好、环境声、隐私与数据。
- “隐私与数据”页包含本地数据说明、清除内容缓存、清除偏好与设置、关闭偏好学习。
- “隐私与数据”页不包含导入导出、事件日志、高级调试或复杂数据管理。

### 内容偏好与轻反馈

- 内容偏好使用明确主题偏好，作为推荐排序信号，不绕过内容授权、质量和 fallback 校验。
- “萌宠”改为更克制的“动物与陪伴”。
- “动物与陪伴”只允许安静、柔和、低刺激、非表情包化的动物内容。
- 内容主题建议包含：自然风光、水面与雨、森林与草地、天空与宇宙、城市与建筑、人文街景、动物与陪伴、艺术与纹理。
- 第一版包含正向偏好与轻量负反馈：喜欢这类、少来点这类。
- 第一版暂不做“不显示这类”的强屏蔽，也不做复杂收藏夹。
- 休息空间中的轻反馈使用图标按钮，不直接显示文字。
- 轻反馈按钮必须有 tooltip 和 aria-label。
- 图标建议：喜欢这类使用 Heart；少来点这类使用 MinusCircle。
- 点击“喜欢这类”只记录偏好，不切换当前画面。
- 点击“少来点这类”记录降权信号，并切换到下一张画面。

### 环境声偏好

- 用户提到的“音乐”在产品文案中统一称为“环境声”。
- 环境声默认关闭。
- 用户可在设置窗口开启“进入休息空间时自动开启环境声”。
- 自动开启环境声时使用上次音量。
- 环境声自动开启开关不放入首次引导，只放入设置窗口。
- 首次引导最多轻描淡写说明声音可在休息空间中手动开启。
- 002 只做少量高质量环境声预设，不做可混合声源或声音调音台。
- 环境声应默认与图片风格自动同步；用户关闭自动匹配时保持当前声音。
- 声音预设建议限制在森林、水声、雨声、风声、夜晚、安静空气等少量类别。
- 切换图片时，同类声音保持当前播放；跨类声音延迟约 1 秒后 crossfade。
- 声音偏好不应导致突然外放；设备不可用时继续无声休息。

### 本地记录与后续 agent 方向

- 002 不纳入本地回顾、趋势页、长期偏好总结或 `soul.md` 写入。
- 002 只保留完整功能闭环需要的显式配置、当前提醒状态、本轮 prompt 行为和内容轻反馈权重。
- 用户喜好长期沉淀、自然语言偏好、`soul.md` 和本地 agent 模式归入后续独立 spec。
- 002 不展示 weekly summary、完成率、连续天数、健康/效率评价或用户画像。

### 范围收敛

- 002 不纳入额外轻提示、周期微休息或 recurring micro-rest。
- 002 只保留工作时间、ActiveFlow 心流保护、完整休息前右下角边缘弧光预告和正式 prompt。
- 002 不引入 Focus、Relax、Wind Down、Sleep 等场景名，继续只围绕“休息”表达。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 让休息节奏适配真实工作日 (Priority: P1, 建议纳入)

用户希望 Venus 不只固定 50+10，而是能适配自己的工作时间、持续输入状态和自然休息，让提醒更少打断、更像一个懂边界的桌面伴侣。

**Why this priority**: MVP 已证明提醒和休息空间闭环可用；下一轮最值得补的是日常使用的“合时宜”。工作时间、心流保护、右下角边缘弧光预告和独立设置窗口能提升日常可用性，同时避免频繁中断用户。

**Independent Test**: 用户配置工作时间和提醒方式后，可独立验证 Venus 只在允许时段提醒；持续输入时不打断；输入停止后先显示右下角边缘弧光，再短缓冲后显示正式 prompt。

**Acceptance Scenarios**:

1. **Given** 用户设置了工作时间，**When** 当前时间在工作时间外，**Then** Venus 不显示休息 prompt，但仍允许用户从托盘手动开始休息。
2. **Given** 用户持续键盘或鼠标输入，**When** 到达预告或正式提醒时间，**Then** Venus 不显示弧光、不显示 prompt，并将提醒顺延到持续输入结束后。
3. **Given** 用户在提醒 overdue 后停止输入，**When** Venus 检测到安静窗口，**Then** 先显示 6-8 秒右下角边缘弧光，并在 30 秒内仍安静时显示正式 prompt。
4. **Given** 用户 hover、focus 或 click 弧光，**When** 轻浮层展开，**Then** 只提供“稍后”和“跳过”，不提供“开始休息”。
5. **Given** 用户从托盘打开设置，**When** 设置窗口已经存在，**Then** Venus 聚焦已有设置窗口，而不是重复创建多个窗口。

---

### User Story 2 - 让休息空间形成个人偏好的美感记忆 (Priority: P2, 建议纳入)

用户希望 Venus 记住自己明确选择的画面主题、声音主题和休息氛围，让每日一景不只是随机内容，而是逐渐靠近自己的审美偏好。

**Why this priority**: Venus 的差异点是美感空间。相比做更多设置，轻量偏好记忆能强化“这是我的休息空间”，同时保留每日一景的低选择负担。

**Independent Test**: 用户在休息空间中收藏、跳过或反馈某个主题后，下一次休息内容选择会体现偏好变化，同时仍保留 fallback 和授权校验。

**Acceptance Scenarios**:

1. **Given** 用户在设置窗口选择内容偏好，**When** Venus 选择下一次每日一景，**Then** 已选主题在合法候选中获得更高排序权重。
2. **Given** 用户在休息空间点击“喜欢这类”图标，**When** Venus 记录反馈，**Then** 当前主题权重提高，但当前画面不切换。
3. **Given** 用户在休息空间点击“少来点这类”图标，**When** Venus 记录反馈，**Then** 当前主题权重降低，并切换到下一张候选画面。
4. **Given** 用户选择“动物与陪伴”，**When** Venus 获取在线候选，**Then** 只允许安静、柔和、低刺激、非表情包化的动物内容。
5. **Given** 用户开启声音并调节音量，**When** 下次进入相似主题的休息空间，**Then** Venus 恢复合适的声音偏好。
6. **Given** 在线 provider 返回不合格内容，**When** Venus 使用缓存或 fallback，**Then** 偏好系统不得绕过授权、质量和主题校验。

---

### User Story 3 - 用轻量回顾帮助用户调整 Venus，而不是打卡 (Priority: P3, 待取舍)

用户希望知道 Venus 是否“太打扰”或“刚刚好”，并能基于少量反馈调整节奏，但不希望看到健康评分、连续打卡或生产力报表。

**Why this priority**: 轻量回顾能帮助后续智能建议，但它也最容易滑向数据仪表盘。建议作为可选能力，先用本地、低压力反馈验证价值。

**Independent Test**: 用户完成或跳过若干次休息后，可在本地看到非常克制的近期模式，并能一键调整提醒强度；关闭回顾后不影响核心休息流程。

**Acceptance Scenarios**:

1. **Given** 用户完成一次休息，**When** Venus 请求反馈，**Then** 只提供轻量选项，例如“刚好”“太早”“太晚”“不想记录”。
2. **Given** 用户多次选择“太早”或“太晚”，**When** Venus 生成建议，**Then** 只建议调整节奏，不使用健康或效率判断。
3. **Given** 用户查看近期记录，**When** 数据展示出现，**Then** 只显示本地的简短趋势，不显示排名、连续天数或绩效评价。
4. **Given** 用户关闭回顾，**When** 后续休息完成，**Then** Venus 不再请求反馈，也不影响提醒、休息空间和声音体验。

---

### User Story 4 - 扩展声音体验但保持休息空间安静 (Priority: P4, 待取舍)

用户希望有少量高质量环境声预设，例如雨声、水声、森林、夜晚、风声，并让声音与图片风格保持同步，但不希望在休息时进入复杂混音界面。

**Why this priority**: 声音是 Venus 的重要氛围层，但第一轮迭代中如果过早做复杂音频系统，会分散对节奏和日常可用性的投入。

**Independent Test**: 用户可在设置窗口启用环境声自动匹配，并验证不同图片主题映射到合适的少量声音预设；声音仍能在 1 秒内开启、静音和停止，结束休息后无残留播放。

**Acceptance Scenarios**:

1. **Given** 用户进入休息空间，**When** 用户开启声音，**Then** Venus 使用与当前图片风格匹配的少量高质量环境声预设，而不是展示完整音频库。
2. **Given** 当前画面主题是雨、湖或森林，**When** Venus 自动选择声音，**Then** 声音主题与视觉主题保持一致。
3. **Given** 用户按 Space 切换图片，**When** 新旧图片属于同类声音，**Then** Venus 保持当前声音不打断。
4. **Given** 用户按 Space 切换到跨类主题图片，**When** 自动匹配开启，**Then** Venus 延迟约 1 秒后 crossfade 到匹配声音。
5. **Given** 音频设备不可用，**When** 用户进入休息空间，**Then** Venus 保持无声可用路径。

## 候选需求清单

### 建议本轮纳入

- **R-001**: Venus MUST allow users to define working hours during which prompts are allowed.
- **R-002**: Venus MUST provide an independent settings window opened from the tray menu.
- **R-003**: Venus MUST save settings changes immediately and provide restore defaults.
- **R-004**: Venus MUST provide a pure visual right-bottom edge-glow pre-notification before a full rest prompt.
- **R-005**: Users MUST be able to mark visual/audio themes as preferred or less preferred from the rest space with one low-friction action.
- **R-006**: Venus MUST use preference signals only to rank already-valid content; preferences MUST NOT bypass license, quality, or fallback checks.
- **R-007**: Venus MUST defer both pre-notification and formal prompts while the user is in ActiveFlow.
- **R-008**: Venus SHOULD restore environment sound preference such as auto-start enabled state and last comfortable volume.
- **R-009**: Venus SHOULD include a first-run onboarding flow with rhythm, content preference, and edge-glow explanation.

### 需要用户取舍

- **R-010**: Venus MAY provide lightweight local rest feedback after a session. [DEFERRED: 002 不纳入；长期偏好总结与 `soul.md` 归入后续本地 agent spec。]
- **R-011**: Venus MAY show a local-only weekly rest pattern summary. [DEFERRED: 002 不做回顾/趋势页、统计页或用户画像。]
- **R-012**: Venus MAY allow two-layer ambient sound mixing. [DEFERRED: 002 只做少量高质量环境声预设和图片风格同步，不做混音。]
- **R-013**: Venus MAY add scene presets such as Focus, Relax, Wind Down. [DEFERRED: 002 不引入场景名，只围绕“休息”表达。]
- **R-014**: Venus MAY support content collections or favorites. [DEFERRED: 002 只做偏好信号，不做收藏夹或素材库。]
- **R-015**: Venus MAY support an optional light-cue mode beyond the 2-minute pre-notification. [DEFERRED: 002 不纳入额外轻提示或微休息。]

### 不建议本轮纳入

- **R-016**: Venus SHOULD NOT add accounts, cloud sync, teams, subscriptions, or social/community features in the next iteration.
- **R-017**: Venus SHOULD NOT add health scores, streaks, leaderboards, productivity scoring, or medicalized claims.
- **R-018**: Venus SHOULD NOT require biometric, location, calendar, or weather data for the next iteration.
- **R-019**: Venus SHOULD NOT add complex automation actions before the core rhythm and preference model is stable.
- **R-020**: Venus SHOULD NOT add recurring micro-rest prompts by default.
- **R-021**: Venus SHOULD NOT write long-term preference summaries to `soul.md` in 002.
- **R-022**: Venus SHOULD NOT add Focus, Relax, Wind Down, Sleep, productivity, or wellness scenario naming in 002.
- **R-023**: Venus SHOULD NOT add sound mixing, playlist, or full sound library controls in 002.

## Edge Cases

- 用户设置的工作时间跨午夜时，Venus 需要明确如何判断允许提醒区间。
- 用户持续输入或高频鼠标操作跨过提醒时间时，Venus 不应显示弧光或 prompt，而应等待自然停顿。
- 用户从 overdue 状态停下后，Venus 应先显示弧光，再短缓冲后显示正式 prompt。
- 用户 hover、focus 或 click 弧光后，如果选择“稍后”或“跳过”，本轮不应再显示正式 prompt。
- 用户连续多次推迟或跳过时，Venus 应降低提醒强度或建议调整节奏。
- 用户偏好某个主题但当天在线 provider 不可用时，Venus 应使用缓存或 fallback，而不是阻塞休息空间。
- 用户反馈“太打扰”后，Venus 应优先减少打扰，而不是继续强化提醒。
- 用户关闭所有记录或偏好学习时，Venus 应保持 MVP 核心流程可用。
- 多显示器、全屏演示和系统锁屏场景不得导致 prompt 遮挡工作内容。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Venus MUST preserve the completed MVP flow of prompt, rest space, optional audio, and return to work.
- **FR-002**: Venus MUST keep all new rhythm, preference, and feedback data local by default.
- **FR-003**: Users MUST be able to set working hours or disable working-hours restrictions entirely.
- **FR-004**: Users MUST be able to open an independent settings window from the tray menu.
- **FR-005**: Venus MUST save settings changes immediately and provide restore defaults.
- **FR-006**: Venus MUST allow users to postpone or skip pre-notifications and prompts without extra confirmation.
- **FR-007**: Venus MUST maintain full-screen quiet suppression across all new prompt types.
- **FR-008**: Venus MUST store visual and audio preference signals without storing workplace content.
- **FR-009**: Venus MUST keep content source, license, quality, and theme validation as hard gates before preference ranking.
- **FR-010**: Venus MUST keep audio start, mute, volume change, and stop feedback within 1 second for any new audio controls.
- **FR-011**: Venus MUST provide a way to opt out of any feedback or local summary feature if that feature is selected.
- **FR-012**: Venus MUST avoid user-facing language that frames rest as medical compliance, productivity scoring, or moral obligation.
- **FR-013**: Venus MUST use a right-bottom edge-glow as the default pre-notification effect.
- **FR-014**: The edge-glow MUST be silent, textless by default, non-modal, non-focus-stealing, and free of system notification surfaces.
- **FR-015**: Venus MUST defer edge-glow and formal prompt while the user is in ActiveFlow.
- **FR-016**: Venus MUST use only keyboard/mouse input rhythm to detect ActiveFlow in the first iteration.
- **FR-017**: Venus MUST provide content preference categories including 自然风光、水面与雨、森林与草地、天空与宇宙、城市与建筑、人文街景、动物与陪伴、艺术与纹理.
- **FR-018**: Rest-space feedback MUST include icon-only “喜欢这类” and “少来点这类” actions with tooltip and accessible labels.
- **FR-019**: Venus MUST keep environment sound off by default unless the user enables auto-start in settings.
- **FR-020**: Venus MUST keep environment sound auto-start out of first-run onboarding; onboarding MAY mention that sound can be manually enabled in rest space.
- **FR-021**: Venus MUST provide a small set of high-quality environment sound presets and automatically match them to visual theme when auto-match is enabled.
- **FR-022**: Venus MUST avoid any user-facing Focus, Relax, Wind Down, Sleep, productivity, or wellness scenario naming in 002.
- **FR-023**: Venus MUST avoid local analytics dashboards, weekly summaries, streaks, scores, or `soul.md` updates in 002.
- **FR-024**: Venus MUST default working-hours restriction to off, while offering 工作日 09:00-18:00 and custom working-hours setup in onboarding/settings.
- **FR-025**: Venus MUST provide 25+5, 50+10, and 75+10 rhythm presets, with 50+10 as the default.
- **FR-026**: Venus MUST support custom work and rest durations within bounded ranges.
- **FR-027**: Venus MUST define ActiveFlow in 002 as any keyboard or mouse input within the last 10 seconds.
- **FR-028**: Venus MUST NOT expose the ActiveFlow threshold as a user-facing setting in 002.
- **FR-029**: The privacy and data settings page MUST include local data explanation, clear content cache, clear preferences/settings, and disable preference learning.
- **FR-030**: Venus MUST NOT include import/export, event log browsing, or advanced debug controls in the 002 settings UI.

### Key Entities *(include if feature involves data)*

- **Working Hours**: Local schedule defining when Venus may show automatic prompts; disabled by default, may use 工作日 09:00-18:00 or custom ranges, and never blocks manual tray rest.
- **Settings Window**: Independent configuration surface opened from tray; includes rhythm, reminders, content preferences, environment sound, privacy, restore defaults, and immediate persistence behavior.
- **Onboarding Flow**: First-run lightweight setup that writes to the same preference model as settings; includes rhythm, content preference, and edge-glow explanation.
- **ActiveFlow**: Local input-derived state indicating sustained keyboard or mouse activity; used only to defer notification surfaces and not stored as workplace content.
- **Rhythm Preset**: User-selectable work/rest pair such as 25+5, 50+10, or 75+10; custom values are bounded to avoid unusable intervals.
- **Privacy and Data Controls**: Settings group for explaining local data use, clearing content cache, clearing preferences/settings, and disabling preference learning.
- **Pre-Notification**: Low-friction signal before a full rest prompt; includes due time, available actions, and suppression conditions.
- **Preference Signal**: Local signal such as liked theme, disliked theme, skipped theme, audio enabled state, or comfortable volume.
- **Rest Feedback**: Optional local response after a rest, such as just right, too early, too late, too interruptive, or no feedback.
- **Local Summary**: Optional non-judgmental view of recent rest patterns without streaks, scores, ranking, or health claims.
- **Sound Preset**: Small environment sound category such as forest, water, rain, air, night, or quiet air; may be auto-matched from visual theme without exposing a mixer.
- **Future Soul Memory**: Deferred local-agent direction for natural-language preference summaries and `soul.md`; explicitly out of scope for 002.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% of test users can configure working hours and understand whether Venus is currently allowed to prompt within 2 minutes.
- **SC-002**: 90% of prompts are suppressed outside configured working hours.
- **SC-003**: 75% of test users can correctly explain the right-bottom edge-glow pre-notification after first-run onboarding.
- **SC-004**: 70% of users who mark content preferences report that the next five rest spaces feel at least as relevant as MVP baseline.
- **SC-005**: 95% of pre-notification, postpone, skip, start rest, mute, and stop actions produce feedback within 1 second.
- **SC-006**: 95% of full rest openings still show online content, cached content, or bundled fallback within 2 seconds.
- **SC-007**: Fewer than 20% of test users describe the new iteration as more stressful, more clinical, or more productivity-focused than MVP.
- **SC-008**: 100% of selected features have documented local data fields, retention behavior, and opt-out behavior before implementation.

## Constitution Alignment *(mandatory)*

- **Documentation Impact**: 下一轮 spec、plan、tasks、quickstart 和用户使用说明继续使用中文。若纳入节奏、偏好或反馈系统，必须用 Mermaid 展示从工作时间、ActiveFlow、弧光预告、正式 prompt、完整休息到反馈/偏好更新的状态流。
- **Testing Expectations**: 每个被选中的用户故事必须有独立可验证测试。P1 需要覆盖工作时间、跨午夜、ActiveFlow 顺延、弧光预告、全屏静默、设置窗口和首次引导；P2 需要覆盖偏好信号、内容授权硬门槛、缓存/fallback、图标轻反馈和声音偏好恢复。
- **Performance Expectations**: 新增提示和控制反馈继续保持 1 秒内可感知；完整休息空间继续保持 2 秒内可见；任何本地统计或偏好计算不得造成可感知启动延迟。
- **UX Consistency Requirements**: 新增 UI 必须保持轻、静、美；不得引入营销首页、复杂设置墙、健康评分、连续打卡、排行榜、生产力仪表盘或大面积高刺激视觉主题。

## Assumptions

- 下一轮仍以 Windows-first 桌面个人应用为主，不扩展到移动端、团队版或账号体系。
- 用户更需要“少打扰、刚刚好、越来越合口味”，而不是更多健康教育内容。
- 所有同类产品参考只用于需求启发；Venus 不复制其医疗化、生产力化或订阅增长路径。
- 若需求取舍存在冲突，优先保留 MVP 的美感空间定位和隐私边界。

## Open Questions

当前 002 scope 的核心产品参数已收敛。后续进入 plan/tasks 前，如需继续澄清，应聚焦实现边界、测试切片和视觉细节，而不是重新打开微休息、统计页、场景名或声音混音等已 deferred 范围。