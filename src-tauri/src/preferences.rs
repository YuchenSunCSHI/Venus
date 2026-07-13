use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const PREFERENCES_SCHEMA_VERSION: u16 = 1;
const PREFERENCES_FILE_NAME: &str = "preferences.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CadencePreferences {
    pub id: String,
    pub work_duration_minutes: u16,
    pub rest_duration_minutes: u16,
    pub postpone_minutes: u16,
    pub prompts_enabled: bool,
    pub temporary_quiet_until: Option<String>,
    pub suggestion_mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPreferences {
    pub schema_version: u16,
    pub cadence: CadencePreferences,
    pub audio_enabled_by_default: bool,
    pub last_volume: u8,
    pub prompt_style: String,
    pub quiet_mode: String,
    pub last_completed_session_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavePreferencesResult {
    pub ok: bool,
    pub persisted_at: Option<String>,
    pub recoverable_error: Option<String>,
}

pub fn default_preferences() -> UserPreferences {
    UserPreferences {
        schema_version: PREFERENCES_SCHEMA_VERSION,
        cadence: CadencePreferences {
            id: "default".to_string(),
            work_duration_minutes: 50,
            rest_duration_minutes: 10,
            postpone_minutes: 5,
            prompts_enabled: true,
            temporary_quiet_until: None,
            suggestion_mode: "fixed".to_string(),
        },
        audio_enabled_by_default: false,
        last_volume: 45,
        prompt_style: "gentle".to_string(),
        quiet_mode: "off".to_string(),
        last_completed_session_at: None,
    }
}

pub fn load_preferences(app: &AppHandle) -> UserPreferences {
    let Ok(path) = preferences_path(app) else {
        return default_preferences();
    };

    let Ok(raw_preferences) = fs::read_to_string(path) else {
        return default_preferences();
    };

    let Ok(preferences) = serde_json::from_str::<UserPreferences>(&raw_preferences) else {
        return default_preferences();
    };

    if is_valid_preferences(&preferences) {
        preferences
    } else {
        default_preferences()
    }
}

pub fn save_preferences(app: &AppHandle, preferences: &UserPreferences) -> SavePreferencesResult {
    if !is_valid_preferences(preferences) {
        return SavePreferencesResult {
            ok: false,
            persisted_at: None,
            recoverable_error: Some("schema_invalid".to_string()),
        };
    }

    let result: Result<String, Box<dyn std::error::Error>> = preferences_path(app).and_then(
        |path| -> Result<String, Box<dyn std::error::Error>> {
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent)?;
            }

            let serialized = serde_json::to_string_pretty(preferences)?;
            fs::write(path, serialized)?;
            Ok(Utc::now().to_rfc3339())
        },
    );

    match result {
        Ok(persisted_at) => SavePreferencesResult {
            ok: true,
            persisted_at: Some(persisted_at),
            recoverable_error: None,
        },
        Err(_) => SavePreferencesResult {
            ok: false,
            persisted_at: None,
            recoverable_error: Some("write_failed".to_string()),
        },
    }
}

fn preferences_path(app: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    Ok(app.path().app_data_dir()?.join(PREFERENCES_FILE_NAME))
}

fn is_valid_preferences(preferences: &UserPreferences) -> bool {
    preferences.schema_version == PREFERENCES_SCHEMA_VERSION
        && preferences.cadence.id == "default"
        && (15..=120).contains(&preferences.cadence.work_duration_minutes)
        && (1..=30).contains(&preferences.cadence.rest_duration_minutes)
        && preferences.cadence.postpone_minutes > 0
        && preferences.cadence.postpone_minutes < preferences.cadence.work_duration_minutes
        && matches!(preferences.cadence.suggestion_mode.as_str(), "fixed" | "suggested")
        && preferences.last_volume <= 100
        && preferences.prompt_style == "gentle"
        && matches!(preferences.quiet_mode.as_str(), "off" | "untilNextInterval" | "untilTime")
}