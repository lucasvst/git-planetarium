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

    // 1. Get commit metadata and message.
    let metadata_output = Command::new("git")
        .arg("show")
        .arg(&commit_hash)
        .arg("--no-patch") // Don't need the full diff here
        .arg("--pretty=format:---GITAGENT_START---%n%h%n%H%n%an%n%ae%n%cn%n%ce%n%cI%n%s%n%b%n---GITAGENT_END---")
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to execute git show: {}", e))?;

    if !metadata_output.status.success() {
        return Err(String::from_utf8_lossy(&metadata_output.stderr).to_string());
    }

    let metadata_str = String::from_utf8_lossy(&metadata_output.stdout);

    // 2. Get file status (name-status)
    let name_status_output = Command::new("git")
        .arg("diff-tree")
        .arg("--no-commit-id")
        .arg("--name-status")
        .arg("-r")
        .arg("-z")
        .arg(&commit_hash)
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to execute git diff-tree --name-status: {}", e))?;

    if !name_status_output.status.success() {
        return Err(String::from_utf8_lossy(&name_status_output.stderr).to_string());
    }
    let name_status_bytes = &name_status_output.stdout;

    // 3. Get file stats (numstat)
    let numstat_output = Command::new("git")
        .arg("diff-tree")
        .arg("--no-commit-id")
        .arg("--numstat")
        .arg("-r")
        .arg("-z")
        .arg(&commit_hash)
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to execute git diff-tree --numstat: {}", e))?;

    if !numstat_output.status.success() {
        return Err(String::from_utf8_lossy(&numstat_output.stderr).to_string());
    }
    let numstat_bytes = &numstat_output.stdout;

    // 4. Combine outputs for parsing.
    let mut combined_output_bytes: Vec<u8> = Vec::new();
    combined_output_bytes.extend_from_slice(metadata_str.as_bytes());
    // The parser expects: <metadata>---GITAGENT_END---<name-status>---GIT_SEPARATOR---<numstat>
    if let Some(index) = metadata_str.find("---GITAGENT_END---") {
        let end_of_metadata = index + "---GITAGENT_END---".len();
        let (metadata_part, _) = metadata_str.split_at(end_of_metadata);

        combined_output_bytes.clear();
        combined_output_bytes.extend_from_slice(metadata_part.as_bytes());
        combined_output_bytes.extend_from_slice(name_status_bytes);
        combined_output_bytes.extend_from_slice(b"---GIT_SEPARATOR---");
        combined_output_bytes.extend_from_slice(numstat_bytes);
    }

    let output_str = String::from_utf8_lossy(&combined_output_bytes);

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

    // --- FILE CHANGES PARSING ---
    let mut file_changes: Vec<FileChange> = Vec::new();
    if let Some(diff_part) = output_str.split("---GITAGENT_END---").nth(1) {
        const SEPARATOR: &str = "---GIT_SEPARATOR---";
        let (name_status_str, numstat_str) = diff_part.split_once(SEPARATOR)
            .unwrap_or((diff_part, ""));

        let mut numstat_map = std::collections::HashMap::new();
        let numstat_entries = numstat_str.trim_matches('\0').split('\0');
        for entry in numstat_entries {
            let parts: Vec<&str> = entry.split('\t').collect();
            if parts.len() == 3 {
                let added = parts[0].parse::<u32>().unwrap_or(0);
                let removed = parts[1].parse::<u32>().unwrap_or(0);
                numstat_map.insert(parts[2].to_string(), (added, removed));
            }
        }

        let mut status_entries = name_status_str.trim_matches('\0').split('\0').peekable();
        while let Some(status_char) = status_entries.next() {
            if status_char.is_empty() {
                continue;
            }

            let status;
            let file_path;
            let mut old_path = None;

            if status_char.starts_with('R') || status_char.starts_with('C') {
                status = if status_char.starts_with('R') { "Renamed".to_string() } else { "Copied".to_string() };
                old_path = status_entries.next().map(|s| s.to_string());
                file_path = status_entries.next().map(|s| s.to_string()).unwrap_or_default();
            } else {
                status = match status_char {
                    "A" => "Added".to_string(),
                    "D" => "Deleted".to_string(),
                    "M" => "Modified".to_string(),
                    _ => "Unknown".to_string(),
                };
                file_path = status_entries.next().map(|s| s.to_string()).unwrap_or_default();
            }

            if file_path.is_empty() {
                continue;
            }

            let (lines_added, lines_removed) = numstat_map.get(&file_path)
                .cloned()
                .unwrap_or_else(|| {
                    if status == "Renamed" && old_path.is_some() {
                        let old = old_path.as_ref().unwrap();
                        numstat_map.iter()
                            .find(|(k, _)| k.contains(old) && k.contains(&file_path))
                            .map(|(_, v)| *v)
                            .unwrap_or((0, 0))
                    } else {
                        (0, 0)
                    }
                });

            file_changes.push(FileChange {
                file_path,
                status,
                lines_added,
                lines_removed,
                diff_snippet: "Diff not implemented".to_string(),
            });
        }
    }

    // --- STATS PARSING ---
    let lines_added: u32 = file_changes.iter().map(|fc| fc.lines_added).sum();
    let lines_removed: u32 = file_changes.iter().map(|fc| fc.lines_removed).sum();
    let files_changed = file_changes.len() as u32;

    let stats = CommitStats {
        files_changed,
        lines_added,
        lines_removed,
        total_changes: lines_added + lines_removed,
    };

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