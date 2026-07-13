mod commands;
mod fullscreen;
mod preferences;
mod tray;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tray::register_tray(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::preferences_load,
            commands::preferences_save,
            commands::desktop_get_quiet_context,
            commands::window_enter_rest_fullscreen,
            commands::window_exit_rest_fullscreen,
            commands::content_cache_asset,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Venus Tauri app");
}