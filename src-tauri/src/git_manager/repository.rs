use std::path::Path;
use std::process::Command;

#[derive(Debug, serde::Serialize)]
pub struct CommitInfo {
    hash: String,
    author: String,
    date: String,
    message: String,
}

#[tauri::command(async)]
pub fn get_repository_commits(repo_name: String, path: String) -> Result<Vec<CommitInfo>, String> {
    let repo_path = Path::new(&path).join(repo_name);
    if !repo_path.exists() || !repo_path.is_dir() {
        return Err(format!("O repositório não foi encontrado em: {}", repo_path.display()));
    }

    let output = Command::new("git")
        .arg("log")
        .arg("--pretty=format:%H|%an|%ad|%s")
        .arg("-n")
        .arg("10")
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Erro ao executar o comando 'git log': {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Erro ao obter os commits: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let commits: Vec<CommitInfo> = stdout
        .lines()
        .map(|line| {
            let parts: Vec<&str> = line.split('|').collect();
            CommitInfo {
                hash: parts.get(0).unwrap_or(&"").to_string(),
                author: parts.get(1).unwrap_or(&"").to_string(),
                date: parts.get(2).unwrap_or(&"").to_string(),
                message: parts.get(3).unwrap_or(&"").to_string(),
            }
        })
        .collect();

    Ok(commits)
}

#[derive(Debug, serde::Serialize)]
pub struct Branch {
    name: String,
    last_commit_date: String,
}

#[tauri::command(async)]
pub fn get_repository_branches(repo_name: String, path: String) -> Result<Vec<Branch>, String> {
    let repo_path = Path::new(&path).join(repo_name);
    if !repo_path.exists() || !repo_path.is_dir() {
        return Err(format!(
            "O repositório não foi encontrado em: {}",
            repo_path.display()
        ));
    }

    let output = Command::new("git")
        .arg("for-each-ref")
        .arg("--format=%(refname:short)|%(committerdate:short)")
        .arg("refs/heads")
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Erro ao executar o comando 'git for-each-ref': {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Erro ao obter as branches: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let branches: Vec<Branch> = stdout
        .lines()
        .map(|line| {
            let parts: Vec<&str> = line.split('|').collect();
            Branch {
                name: parts.get(0).unwrap_or(&"").to_string(),
                last_commit_date: parts.get(1).unwrap_or(&"").to_string(),
            }
        })
        .collect();

    Ok(branches)
}
