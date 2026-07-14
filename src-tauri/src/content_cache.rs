use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

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

pub async fn cache_asset(app: &AppHandle, input: CacheAssetInput) -> CacheAssetResult {
    if input.license_note.trim().is_empty() {
        return recoverable("license_missing");
    }

    let Some(extension) = supported_extension(&input.remote_url, &input.asset_type) else {
        return recoverable("unsupported_format");
    };

    let bytes = match download_asset(&input.remote_url).await {
        Ok(bytes) => bytes,
        Err(error) => return recoverable(error),
    };

    let cache_path = match cache_path(app, &input, extension) {
        Ok(path) => path,
        Err(_) => return recoverable("write_failed"),
    };

    if let Some(parent) = cache_path.parent() {
        if fs::create_dir_all(parent).is_err() {
            return recoverable("write_failed");
        }
    }

    if fs::write(&cache_path, bytes).is_err() {
        return recoverable("write_failed");
    }

    CacheAssetResult {
        ok: true,
        local_path: Some(cache_path.to_string_lossy().to_string()),
        cached_at: Some(Utc::now().to_rfc3339()),
        recoverable_error: None,
    }
}

async fn download_asset(remote_url: &str) -> Result<Vec<u8>, &'static str> {
    if !remote_url.starts_with("https://") && !remote_url.starts_with("http://") {
        return Err("unsupported_format");
    }

    let response = reqwest::get(remote_url).await.map_err(|_| "network_failed")?;
    if !response.status().is_success() {
        return Err("download_failed");
    }

    response.bytes().await.map(|bytes| bytes.to_vec()).map_err(|_| "download_failed")
}

fn cache_path(app: &AppHandle, input: &CacheAssetInput, extension: &str) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let asset_id = input
        .provider_asset_id
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("asset");
    let file_name = format!("{}-{}.{}", sanitize_segment(&input.source_provider), sanitize_segment(asset_id), extension);

    Ok(app.path().app_data_dir()?.join("content-cache").join(&input.asset_type).join(file_name))
}

fn supported_extension(remote_url: &str, asset_type: &str) -> Option<&'static str> {
    let path = remote_url.split('?').next().unwrap_or(remote_url).to_ascii_lowercase();
    let extension = path.rsplit('.').next()?;

    match (asset_type, extension) {
        ("visual", "jpg" | "jpeg") => Some("jpg"),
        ("visual", "png") => Some("png"),
        ("visual", "webp") => Some("webp"),
        ("visual", "svg") => Some("svg"),
        ("audio", "mp3") => Some("mp3"),
        ("audio", "ogg") => Some("ogg"),
        ("audio", "wav") => Some("wav"),
        _ => None,
    }
}

fn sanitize_segment(value: &str) -> String {
    value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == '-' || character == '_' {
                character
            } else {
                '-'
            }
        })
        .collect()
}

fn recoverable(error: &str) -> CacheAssetResult {
    CacheAssetResult {
        ok: false,
        local_path: None,
        cached_at: None,
        recoverable_error: Some(error.to_string()),
    }
}