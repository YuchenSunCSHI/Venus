use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestFullscreenInput {
    pub session_id: String,
    pub display_mode: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestFullscreenResult {
    pub ok: bool,
    pub entered_at: Option<String>,
    pub exited_at: Option<String>,
    pub recoverable_error: Option<String>,
}

pub fn enter_rest_fullscreen(app: &AppHandle, input: RestFullscreenInput) -> RestFullscreenResult {
    let Some(window) = app.get_webview_window("main") else {
        return recoverable("window_unavailable");
    };

    if input.display_mode.as_deref() == Some("primaryDisplay") || input.display_mode.as_deref() == Some("currentDisplay") {
        if window.set_fullscreen(true).is_ok() && window.set_focus().is_ok() {
            return RestFullscreenResult {
                ok: true,
                entered_at: Some(Utc::now().to_rfc3339()),
                exited_at: None,
                recoverable_error: None,
            };
        }
    }

    recoverable("window_unavailable")
}

pub fn exit_rest_fullscreen(app: &AppHandle, _input: RestFullscreenInput) -> RestFullscreenResult {
    let Some(window) = app.get_webview_window("main") else {
        return recoverable("window_unavailable");
    };

    let _ = window.set_fullscreen(false);
    let _ = window.set_focus();

    RestFullscreenResult {
        ok: true,
        entered_at: None,
        exited_at: Some(Utc::now().to_rfc3339()),
        recoverable_error: None,
    }
}

fn recoverable(error: &str) -> RestFullscreenResult {
    RestFullscreenResult {
        ok: false,
        entered_at: None,
        exited_at: None,
        recoverable_error: Some(error.to_string()),
    }
}