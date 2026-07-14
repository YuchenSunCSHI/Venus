# Feature Specification: Venus 下一轮迭代候选需求

**Feature Branch**: `未创建 - 当前为需求取舍草案`

**Created**: 2026-07-14

**Status**: Draft - Awaiting User Selection

**Input**: User description: "当前 MVP 已完成，希望在此基础上进行下一轮迭代。先参考同类产品实现，罗列可选需求，由用户取舍；可以创建一个新的 Spec。"

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

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 让休息节奏适配真实工作日 (Priority: P1, 建议纳入)

用户希望 Venus 不只固定 50+10，而是能适配自己的工作时间、短会间隙和自然休息，让提醒更少打断、更像一个懂边界的桌面伴侣。

**Why this priority**: MVP 已证明提醒和休息空间闭环可用；下一轮最值得补的是日常使用的“合时宜”。工作时间、微休息和提醒预告是同类桌面休息工具中最常见的成熟能力，也最容易提升留存。

**Independent Test**: 用户配置工作时间、启用微休息和提醒预告后，可独立验证 Venus 只在工作时间内提醒、能区分微休息与完整休息，并在即将提醒前给出低打扰预告。

**Acceptance Scenarios**:

1. **Given** 用户设置了工作时间，**When** 当前时间在工作时间外，**Then** Venus 不显示休息 prompt，但仍允许用户从托盘手动开始休息。
2. **Given** 用户启用了微休息，**When** 到达微休息时间，**Then** Venus 显示一个比完整休息更短、更低存在感的提醒，不强制进入全屏空间。
3. **Given** 完整休息即将到来，**When** 距离提醒还有短时间，**Then** Venus 可给出提前预告，让用户有机会稍后或跳过。
4. **Given** 用户刚离开电脑或已经自然休息过，**When** 回到工作状态，**Then** Venus 可延后下一次提醒，而不是立刻补弹 prompt。

---

### User Story 2 - 让休息空间形成个人偏好的美感记忆 (Priority: P2, 建议纳入)

用户希望 Venus 记住自己喜欢的画面主题、声音主题和休息氛围，让每日一景不只是随机内容，而是逐渐靠近自己的审美偏好。

**Why this priority**: Venus 的差异点是美感空间。相比做更多设置，轻量偏好记忆能强化“这是我的休息空间”，同时保留每日一景的低选择负担。

**Independent Test**: 用户在休息空间中收藏、跳过或反馈某个主题后，下一次休息内容选择会体现偏好变化，同时仍保留 fallback 和授权校验。

**Acceptance Scenarios**:

1. **Given** 用户在休息空间中喜欢某张画面，**When** 用户标记“喜欢这类画面”，**Then** Venus 记录主题偏好，而不要求用户管理素材库。
2. **Given** 用户多次跳过某类主题，**When** Venus 选择下一次每日一景，**Then** 该主题的优先级降低。
3. **Given** 用户开启声音并调节音量，**When** 下次进入相似主题的休息空间，**Then** Venus 恢复合适的声音偏好。
4. **Given** 在线 provider 返回不合格内容，**When** Venus 使用缓存或 fallback，**Then** 偏好系统不得绕过授权、质量和主题校验。

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

用户希望有更丰富的环境声选择，例如雨声、水声、森林、夜晚、风声，甚至组合两个低强度声源，但不希望在休息时进入复杂混音界面。

**Why this priority**: 声音是 Venus 的重要氛围层，但第一轮迭代中如果过早做复杂音频系统，会分散对节奏和日常可用性的投入。

**Independent Test**: 用户可选择一个声音预设或让 Venus 自动匹配视觉主题；声音仍能在 1 秒内开启、静音和停止，结束休息后无残留播放。

**Acceptance Scenarios**:

1. **Given** 用户进入休息空间，**When** 用户打开声音菜单，**Then** Venus 只展示少量预设，而不是完整音频库。
2. **Given** 当前画面主题是雨、湖或森林，**When** Venus 自动选择声音，**Then** 声音主题与视觉主题保持一致。
3. **Given** 用户选择混合声音，**When** 两个声源同时播放，**Then** 总音量保持低强度，不出现突兀过响或爆音。
4. **Given** 音频设备不可用，**When** 用户进入休息空间，**Then** Venus 保持无声可用路径。

## 候选需求清单

### 建议本轮纳入

- **R-001**: Venus MUST allow users to define working hours during which prompts are allowed.
- **R-002**: Venus MUST support at least one micro-rest mode that is shorter and less immersive than the full rest space.
- **R-003**: Venus SHOULD provide a quiet pre-notification before a full rest prompt, allowing postpone or skip before interruption.
- **R-004**: Venus SHOULD detect natural away time or idle time locally and adjust the next prompt without collecting app content.
- **R-005**: Users MUST be able to mark visual/audio themes as preferred or less preferred from the rest space with one low-friction action.
- **R-006**: Venus MUST use preference signals only to rank already-valid content; preferences MUST NOT bypass license, quality, or fallback checks.
- **R-007**: Venus SHOULD restore per-theme audio preference such as enabled state and last comfortable volume.

### 需要用户取舍

- **R-008**: Venus MAY provide lightweight local rest feedback after a session. [NEEDS CLARIFICATION: 是否需要“刚好/太早/太晚”反馈入口？]
- **R-009**: Venus MAY show a local-only weekly rest pattern summary. [NEEDS CLARIFICATION: 是否接受任何形式的记录展示，还是完全避免统计？]
- **R-010**: Venus MAY allow two-layer ambient sound mixing. [NEEDS CLARIFICATION: 声音体验是做“少量预设”还是“可混合声源”？]
- **R-011**: Venus MAY add scene presets such as Focus, Relax, Wind Down. [NEEDS CLARIFICATION: 是否会削弱 Venus 作为“休息空间”而不是泛专注工具的定位？]
- **R-012**: Venus MAY support content collections or favorites. [NEEDS CLARIFICATION: 是否需要收藏夹，还是只保留偏好信号不做素材库？]

### 不建议本轮纳入

- **R-013**: Venus SHOULD NOT add accounts, cloud sync, teams, subscriptions, or social/community features in the next iteration.
- **R-014**: Venus SHOULD NOT add health scores, streaks, leaderboards, productivity scoring, or medicalized claims.
- **R-015**: Venus SHOULD NOT require biometric, location, calendar, or weather data for the next iteration.
- **R-016**: Venus SHOULD NOT add complex automation actions before the core rhythm and preference model is stable.

## Edge Cases

- 用户设置的工作时间跨午夜时，Venus 需要明确如何判断允许提醒区间。
- 用户在微休息提醒后立刻进入完整休息时，Venus 不应连续弹出两个提醒。
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
- **FR-004**: Users MUST be able to distinguish micro-rest prompts from full rest prompts through copy, duration, and UI treatment.
- **FR-005**: Venus MUST provide a clear way to start a full rest from a micro-rest or tray action.
- **FR-006**: Venus MUST allow users to postpone or skip pre-notifications and prompts without extra confirmation.
- **FR-007**: Venus MUST maintain full-screen quiet suppression across all new prompt types.
- **FR-008**: Venus MUST store visual and audio preference signals without storing workplace content.
- **FR-009**: Venus MUST keep content source, license, quality, and theme validation as hard gates before preference ranking.
- **FR-010**: Venus MUST keep audio start, mute, volume change, and stop feedback within 1 second for any new audio controls.
- **FR-011**: Venus MUST provide a way to opt out of any feedback or local summary feature if that feature is selected.
- **FR-012**: Venus MUST avoid user-facing language that frames rest as medical compliance, productivity scoring, or moral obligation.

### Key Entities *(include if feature involves data)*

- **Working Hours**: Local schedule defining when Venus may show prompts; includes enabled state, day ranges, start/end time, and behavior outside working hours.
- **Rest Mode**: Represents micro-rest or full-rest; includes duration, prompt style, eligible actions, and whether full-screen rest space is used.
- **Pre-Notification**: Low-friction signal before a full rest prompt; includes due time, available actions, and suppression conditions.
- **Preference Signal**: Local signal such as liked theme, disliked theme, skipped theme, audio enabled state, or comfortable volume.
- **Rest Feedback**: Optional local response after a rest, such as just right, too early, too late, too interruptive, or no feedback.
- **Local Summary**: Optional non-judgmental view of recent rest patterns without streaks, scores, ranking, or health claims.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% of test users can configure working hours and understand whether Venus is currently allowed to prompt within 2 minutes.
- **SC-002**: 90% of prompts are suppressed outside configured working hours.
- **SC-003**: 75% of test users can correctly explain the difference between micro-rest and full rest after seeing each once.
- **SC-004**: 70% of users who mark content preferences report that the next five rest spaces feel at least as relevant as MVP baseline.
- **SC-005**: 95% of pre-notification, postpone, skip, start rest, mute, and stop actions produce feedback within 1 second.
- **SC-006**: 95% of full rest openings still show online content, cached content, or bundled fallback within 2 seconds.
- **SC-007**: Fewer than 20% of test users describe the new iteration as more stressful, more clinical, or more productivity-focused than MVP.
- **SC-008**: 100% of selected features have documented local data fields, retention behavior, and opt-out behavior before implementation.

## Constitution Alignment *(mandatory)*

- **Documentation Impact**: 下一轮 spec、plan、tasks、quickstart 和用户使用说明继续使用中文。若纳入节奏、偏好或反馈系统，必须用 Mermaid 展示从工作时间、微休息、预通知、完整休息到反馈/偏好更新的状态流。
- **Testing Expectations**: 每个被选中的用户故事必须有独立可验证测试。P1 需要覆盖工作时间、跨午夜、微休息、预通知、全屏静默和自然离开；P2 需要覆盖偏好信号、内容授权硬门槛、缓存/fallback 和声音偏好恢复。
- **Performance Expectations**: 新增提示和控制反馈继续保持 1 秒内可感知；完整休息空间继续保持 2 秒内可见；任何本地统计或偏好计算不得造成可感知启动延迟。
- **UX Consistency Requirements**: 新增 UI 必须保持轻、静、美；不得引入营销首页、复杂设置墙、健康评分、连续打卡、排行榜、生产力仪表盘或大面积高刺激视觉主题。

## Assumptions

- 下一轮仍以 Windows-first 桌面个人应用为主，不扩展到移动端、团队版或账号体系。
- 用户更需要“少打扰、刚刚好、越来越合口味”，而不是更多健康教育内容。
- 所有同类产品参考只用于需求启发；Venus 不复制其医疗化、生产力化或订阅增长路径。
- 若需求取舍存在冲突，优先保留 MVP 的美感空间定位和隐私边界。

## Open Questions

1. 本轮是否把 **P1 工作时间 + 微休息 + 提前预告** 作为主线？
2. 内容偏好要做到什么程度：只做“喜欢/少来点这类”，还是做收藏夹？
3. 是否接受任何本地回顾/趋势？如果接受，是只服务节奏建议，还是允许用户主动查看？
4. 声音下一步是“少量高质量预设”，还是“可混合声源”？
5. 是否要引入 Focus/Relax/Wind Down 等场景名，还是继续只围绕“休息”表达？