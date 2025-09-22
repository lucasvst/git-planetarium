#[path = "modules/git_manager.rs"]
mod git_manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            git_manager::setup,
            git_manager::git_clone,
            git_manager::list_repositories
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
