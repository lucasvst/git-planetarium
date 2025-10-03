mod git_manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            git_manager::workspace::setup,
            git_manager::workspace::git_clone,
            git_manager::workspace::list_repositories,
            git_manager::repository::get_repository_commits,
            git_manager::repository::get_repository_branches,
            git_manager::commit::get_commit_details
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
