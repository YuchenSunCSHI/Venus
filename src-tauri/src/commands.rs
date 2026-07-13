use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::fullscreen::is_fullscreen_context;
use crate::preferences::{load_preferences, save_preferences, SavePreferencesResult, UserPreferences};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuietContext {
    pub should_suppress_prompt: bool,
    pub reason: Option<String>,
    pub checked_at: String,
}

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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CacheAssetInput {
    pub asset_type: String,
    pub source_provider: String,
    pub provider_asset_id: Option<String>,
    pub remote_url: String,
    pub license_note: String,
    pub attribution: Option<String>,
    pub expected_theme: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CacheAssetResult {
    pub ok: bool,
    pub local_path: Option<String>,
    pub cached_at: Option<String>,
    pub recoverable_error: Option<String>,
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
pub async fn window_enter_rest_fullscreen(input: RestFullscreenInput) -> Result<RestFullscreenResult, String> {
    let _session_id = input.session_id;
    Ok(RestFullscreenResult {
        ok: true,
        entered_at: Some(Utc::now().to_rfc3339()),
        exited_at: None,
        recoverable_error: None,
    })
}

#[tauri::command]
pub async fn window_exit_rest_fullscreen(input: RestFullscreenInput) -> Result<RestFullscreenResult, String> {
    let _session_id = input.session_id;
    Ok(RestFullscreenResult {
        ok: true,
        entered_at: None,
        exited_at: Some(Utc::now().to_rfc3339()),
        recoverable_error: None,
    })
}

#[tauri::command]
pub async fn content_cache_asset(input: CacheAssetInput) -> Result<CacheAssetResult, String> {
    let recoverable_error = if input.license_note.trim().is_empty() {
        Some("license_missing".to_string())
    } else {
        Some("network_failed".to_string())
    };

    Ok(CacheAssetResult {
        ok: false,
        local_path: None,
        cached_at: None,
        recoverable_error,
    })
}