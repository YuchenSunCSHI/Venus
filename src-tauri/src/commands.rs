use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::content_cache::{cache_asset, CacheAssetInput, CacheAssetResult};
use crate::fullscreen::is_fullscreen_context;
use crate::preferences::{load_preferences, save_preferences, SavePreferencesResult, UserPreferences};
use crate::window::{enter_rest_fullscreen, exit_rest_fullscreen, RestFullscreenInput, RestFullscreenResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuietContext {
    pub should_suppress_prompt: bool,
    pub reason: Option<String>,
    pub checked_at: String,
}

#[tauri::command]
pub async fn preferences_load(app: AppHandle) -> Result<UserPreferences, String> {
    Ok(load_preferences(&app))
}

#[tauri::command]
pub async fn preferences_save(app: AppHandle, input: UserPreferences) -> Result<SavePreferencesResult, String> {
    Ok(save_preferences(&app, &input))
}

#[tauri::command]
pub async fn desktop_get_quiet_context() -> Result<QuietContext, String> {
    let fullscreen_detected = is_fullscreen_context();

    Ok(QuietContext {
        should_suppress_prompt: fullscreen_detected,
        reason: if fullscreen_detected {
            Some("fullscreenDetected".to_string())
        } else {
            None
        },
        checked_at: Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn window_enter_rest_fullscreen(app: AppHandle, input: RestFullscreenInput) -> Result<RestFullscreenResult, String> {
    Ok(enter_rest_fullscreen(&app, input))
}

#[tauri::command]
pub async fn window_exit_rest_fullscreen(app: AppHandle, input: RestFullscreenInput) -> Result<RestFullscreenResult, String> {
    Ok(exit_rest_fullscreen(&app, input))
}

#[tauri::command]
pub async fn content_cache_asset(app: AppHandle, input: CacheAssetInput) -> Result<CacheAssetResult, String> {
    Ok(cache_asset(&app, input).await)
}