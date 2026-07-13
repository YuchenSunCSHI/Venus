use chrono::Utc;
use serde::Serialize;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter};

const TRAY_EVENT_NAME: &str = "desktop://tray-action";
const ACTION_START_REST: &str = "startRest";
const ACTION_PAUSE_PROMPTS: &str = "pausePrompts";
const ACTION_RESUME_PROMPTS: &str = "resumePrompts";
const ACTION_QUIT: &str = "quit";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TrayActionPayload {
    action: String,
    emitted_at: String,
}

pub fn register_tray(app: &AppHandle) -> tauri::Result<()> {
    let start_rest = MenuItem::with_id(app, ACTION_START_REST, "开始休息", true, None::<&str>)?;
    let pause_prompts = MenuItem::with_id(app, ACTION_PAUSE_PROMPTS, "暂停提醒", true, None::<&str>)?;
    let resume_prompts = MenuItem::with_id(app, ACTION_RESUME_PROMPTS, "恢复提醒", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, ACTION_QUIT, "退出 Venus", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&start_rest, &pause_prompts, &resume_prompts, &quit])?;

    let icon = app.default_window_icon().cloned();
    let mut builder = TrayIconBuilder::with_id("venus")
        .menu(&menu)
        .tooltip("Venus")
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id().as_ref() {
            ACTION_START_REST | ACTION_PAUSE_PROMPTS | ACTION_RESUME_PROMPTS => {
                let _ = emit_tray_action(app, event.id().as_ref());
            }
            ACTION_QUIT => {
                let _ = emit_tray_action(app, ACTION_QUIT);
                app.exit(0);
            }
            _ => {}
        });

    if let Some(icon) = icon {
        builder = builder.icon(icon);
    }

    builder.build(app)?;
    Ok(())
}

fn emit_tray_action(app: &AppHandle, action: &str) -> tauri::Result<()> {
    app.emit(
        TRAY_EVENT_NAME,
        TrayActionPayload {
            action: action.to_string(),
            emitted_at: Utc::now().to_rfc3339(),
        },
    )
}