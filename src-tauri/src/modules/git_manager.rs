use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(Debug, serde::Serialize)]
pub struct RepositoryInfo {
    name: String,
    last_commit_date: String,
    branch_count: u32,
    current_branch: String,
}

#[derive(Debug, serde::Serialize)]
pub struct CommitInfo {
    hash: String,
    author: String,
    date: String,
    message: String,
}

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
pub fn list_repositories(path: String) -> Result<Vec<RepositoryInfo>, String> {
    let path = Path::new(&path);
    if !path.exists() || !path.is_dir() {
        return Err(format!("O caminho não é um diretório válido: {}", path.display()));
    }

    let mut repos: Vec<RepositoryInfo> = Vec::new();

    for entry in fs::read_dir(path).map_err(|e| format!("Erro ao ler o diretório: {}", e))? {
        let entry = entry.map_err(|e| format!("Erro ao ler entrada: {}", e))?;
        let entry_path = entry.path();

        if entry_path.is_dir() {
            let git_path = entry_path.join(".git");
            if git_path.exists() && git_path.is_dir() {
                // A pasta é um repositório Git, vamos coletar as informações
                if let Some(name) = entry_path.file_name() {
                    let name_str = name.to_str().unwrap_or("unknown").to_string();

                    // Comando para pegar a data do último commit
                    let last_commit_date = Command::new("git")
                        .arg("log").arg("-1").arg("--format=%cd")
                        .current_dir(&entry_path)
                        .output().ok()
                        .and_then(|o| String::from_utf8(o.stdout).ok())
                        .unwrap_or_else(|| "N/A".to_string());

                    // Comando para contar o número de branches
                    let branch_count = Command::new("git")
                        .arg("branch").arg("-a")
                        .current_dir(&entry_path)
                        .output().ok()
                        .and_then(|o| String::from_utf8(o.stdout).ok())
                        .map(|s| s.lines().count() as u32)
                        .unwrap_or(0);

                    let current_branch = Command::new("git")
                        .arg("branch").arg("--show-current")
                        .current_dir(&entry_path)
                        .output().ok()
                        .and_then(|o| String::from_utf8(o.stdout).ok())
                        .unwrap_or("unknown".to_string());

                    repos.push(RepositoryInfo {
                        name: name_str,
                        last_commit_date: last_commit_date.trim().to_string(),
                        branch_count,
                        current_branch: current_branch,
                    });
                }
            }
        }
    }

    Ok(repos)
}

#[tauri::command]
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

#[tauri::command]
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

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitStats {
    files_changed: u32,
    lines_added: u32,
    lines_removed: u32,
    total_changes: u32,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChange {
    file_path: String,
    status: String,
    lines_added: u32,
    lines_removed: u32,
    diff_snippet: String,
}

#[derive(Debug, serde::Serialize)]
pub struct Reference {
    #[serde(rename = "type")]
    ref_type: String,
    value: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitDetails {
    hash_short: String,
    hash_full: String,
    repository_name: String,
    repository_path: String,
    author_name: String,
    author_email: String,
    committer_name: String,
    committer_email: String,
    committer_date: String,
    message_title: String,
    message_body: String,
    references: Vec<Reference>,
    branches_on_commit: Vec<String>,
    stats: CommitStats,
    file_changes: Vec<FileChange>,
}

#[tauri::command]
pub fn get_commit_details(
    repo_name: String,
    commit_hash: String,
    path: String,
) -> Result<CommitDetails, String> {
    let repo_path = Path::new(&path).join(&repo_name);
    if !repo_path.exists() || !repo_path.is_dir() {
        return Err(format!(
            "O repositório não foi encontrado em: {}",
            repo_path.display()
        ));
    }

    // 1. Get commit metadata, message, and stats in one command
    let output = Command::new("git")
        .arg("show")
        .arg(&commit_hash)
        .arg("--pretty=format:---GITAGENT_START---%n%h%n%H%n%an%n%ae%n%cn%n%ce%n%cI%n%s%n%b%n---GITAGENT_END---")
        .arg("--stat")
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to execute git show: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let output_str = String::from_utf8_lossy(&output.stdout);

    // --- METADATA PARSING ---
    let metadata_part = output_str
        .split("---GITAGENT_START---")
        .nth(1)
        .unwrap_or("")
        .split("---GITAGENT_END---")
        .next()
        .unwrap_or("");

    let mut lines = metadata_part.lines().skip(1); // Skip the first empty line
    let hash_short = lines.next().unwrap_or("").to_string();
    let hash_full = lines.next().unwrap_or("").to_string();
    let author_name = lines.next().unwrap_or("").to_string();
    let author_email = lines.next().unwrap_or("").to_string();
    let committer_name = lines.next().unwrap_or("").to_string();
    let committer_email = lines.next().unwrap_or("").to_string();
    let committer_date = lines.next().unwrap_or("").to_string();
    let message_title = lines.next().unwrap_or("").to_string();
    let message_body = lines.collect::<Vec<&str>>().join("\n");

    // --- STATS PARSING ---
    let mut files_changed = 0;
    let mut lines_added = 0;
    let mut lines_removed = 0;

    if let Some(stat_summary) = output_str.lines().last() {
        if stat_summary.contains("changed") {
            let parts: Vec<&str> = stat_summary.split(", ").collect();
            for part in parts {
                if let Some(num_str) = part.split_whitespace().next() {
                    if part.contains("file") {
                        files_changed = num_str.parse().unwrap_or(0);
                    } else if part.contains("insertion") {
                        lines_added = num_str.parse().unwrap_or(0);
                    } else if part.contains("deletion") {
                        lines_removed = num_str.parse().unwrap_or(0);
                    }
                }
            }
        }
    }

    let stats = CommitStats {
        files_changed,
        lines_added,
        lines_removed,
        total_changes: lines_added + lines_removed,
    };

    // --- FILE CHANGES PARSING ---
    // This part is more complex, as we need status, and diff snippets.
    // For simplicity in this example, we'll get the file list and a mock snippet.
    // A full implementation would parse the diff output from the `git show` command.
    let mut file_changes: Vec<FileChange> = Vec::new();
    if let Some(diff_part) = output_str.split("---GITAGENT_END---").nth(1) {
        // A simplified way to find file paths from the stat line
        for line in diff_part.lines() {
            if line.contains("|") && !line.starts_with(" ") {
                let file_path = line.split("|").next().unwrap_or("").trim().to_string();
                if !file_path.is_empty() {
                     file_changes.push(FileChange {
                        file_path,
                        status: "Modified".to_string(), // Placeholder
                        lines_added: 0, // Placeholder
                        lines_removed: 0, // Placeholder
                        diff_snippet: "Diff not implemented".to_string(), // Placeholder
                    });
                }
            }
        }
    }


    // --- BRANCHES AND TAGS ---
    let branches_output = Command::new("git")
        .arg("branch")
        .arg("--contains")
        .arg(&commit_hash)
        .arg("--format=%(refname:short)")
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to get branches: {}", e))?;
    let branches_str = String::from_utf8_lossy(&branches_output.stdout);
    let branches_on_commit: Vec<String> = branches_str.lines().map(|s| s.trim().to_string()).collect();

    let tags_output = Command::new("git")
        .arg("tag")
        .arg("--contains")
        .arg(&commit_hash)
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to get tags: {}", e))?;
    let tags_str = String::from_utf8_lossy(&tags_output.stdout);
    let references: Vec<Reference> = tags_str.lines().map(|s| Reference {
        ref_type: "TAG".to_string(),
        value: s.trim().to_string(),
    }).collect();


    Ok(CommitDetails {
        hash_short,
        hash_full,
        repository_name: repo_name,
        repository_path: repo_path.to_str().unwrap_or("").to_string(),
        author_name,
        author_email,
        committer_name,
        committer_email,
        committer_date,
        message_title,
        message_body,
        references,
        branches_on_commit,
        stats,
        file_changes,
    })
}