use std::fs;
use std::path::Path;
use std::process::Command;

#[tauri::command]
pub fn setup(path: String) -> Result<String, String> {
    let path = Path::new(&path);
    // Verifica se o caminho já existe e é um diretório
    if path.exists() && path.is_dir() {
        return Ok(format!("Diretório já existe: {}", path.display()));
    }

    // Cria o diretório (e todos os pais, se necessário)
    match fs::create_dir_all(path) {
        Ok(_) => Ok(format!("Diretório criado com sucesso: {}", path.display())),
        Err(e) => Err(format!("Erro ao criar o diretório: {}", e)),
    }
}

#[tauri::command]
pub fn git_clone(repo_url: String, target_dir: String) -> Result<String, String> {
    let output = Command::new("git")
        .arg("clone")
        .arg(&repo_url)
        .arg(&target_dir)
        .output();

    match output {
        Ok(o) => {
            if o.status.success() {
                Ok(format!(
                    "Repositório clonado com sucesso em: {}",
                    target_dir
                ))
            } else {
                let stderr = String::from_utf8_lossy(&o.stderr);
                Err(format!("Erro ao clonar repositório: {}", stderr))
            }
        }
        Err(e) => Err(format!("Erro ao executar o comando 'git clone': {}", e)),
    }
}

#[tauri::command]
pub fn list_repositories(path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&path);

    if !path.exists() || !path.is_dir() {
        return Err(format!("O caminho não é um diretório válido: {}", path.display()));
    }

    let mut repos: Vec<String> = Vec::new();

    for entry in fs::read_dir(path).map_err(|e| format!("Erro ao ler o diretório: {}", e))? {
        let entry = entry.map_err(|e| format!("Erro ao ler entrada: {}", e))?;
        let entry_path = entry.path();

        if entry_path.is_dir() {
            // Verifica se a pasta contém um subdiretório .git
            let git_path = entry_path.join(".git");
            if git_path.exists() && git_path.is_dir() {
                if let Some(name) = entry_path.file_name() {
                    if let Some(s_name) = name.to_str() {
                        repos.push(s_name.to_string());
                    }
                }
            }
        }
    }

    Ok(repos)
}