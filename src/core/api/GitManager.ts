import { invoke } from '@tauri-apps/api/core';

export interface Repository {
  name: string;
  last_commit_date: string;
  branch_count: number;
  current_branch: string;
}

export const Setup = async (directoryPath: string) => {
    return await invoke<string>('setup', { path: directoryPath });
}
export const ListRepositories = async (directoryPath: string) => {
    return await invoke<Repository[]>('list_repositories', { path: directoryPath });
}
export const GitClone = async (repoUrl: string, directoryPath: string) => {
    return await invoke<string>('git_clone', { repoUrl: repoUrl, targetDir: directoryPath });
}
export const GetRepositoryCommits = async (repoName: string, directoryPath: string) => {
    return await invoke<any[]>('get_repository_commits', { repoName: repoName, path: directoryPath });
}
export const GetRepositoryBranches = async (repoName: string, directoryPath: string) => {
    return await invoke<any[]>('get_repository_branches', { repoName: repoName, path: directoryPath });
}
export const GetCommitDetails = async (repoName: string, commitHash: string, directoryPath: string) => {
    // return await invoke<any[]>('get_commit_details', { repoName, commitHash, path: directoryPath });
    // BELOW THIS IS A MOCK. @TODO: Implement this payload on the rust side.
    return {
        // --- SEÇÃO 1: METADADOS E CONTEXTO DO COMMIT ---
        "hash_short": "a1b2c3d",
        "hash_full": "a1b2c3d4e5f67890abcdef1234567890abcdef",
        "repository_name": "backend-api-service",
        "repository_path": "/caminho/completo/para/o/repo/backend-api-service",

        "author_name": "Joao Silva",
        "author_email": "joao.silva@empresa.com",
        "committer_name": "Maria Oliveira", // Pode ser diferente se for um merge
        "committer_date": "2025-10-02T14:30:00Z", // Formato ISO 8601 é ideal

        "message_title": "feat: Adiciona cache redis para endpoints de usuário",
        "message_body": "Implementa o cache de 30 minutos para as rotas /users. Resolve #1234.", // Corpo da mensagem

        "references": [
            {"type": "TAG", "value": "v1.5.0"}
        ],

        "branches_on_commit": ["main", "feature/redis-cache"], // Em quais branches o commit está presente

        // --- SEÇÃO 2: IMPACTO DA MUDANÇA (AS ESTATÍSTICAS) ---
        "stats": {
            "files_changed": 5,
            "lines_added": 125,
            "lines_removed": 35,
            "total_changes": 160 // lines_added + lines_removed
        },

        // --- SEÇÃO 3: O CONTEÚDO DA MUDANÇA (LISTA E DIFF) ---
        "file_changes": [
            {
                "file_path": "src/user_service.rs",
                "status": "Modified", // Added, Deleted, Modified, Renamed
                "lines_added": 80,
                "lines_removed": 5,
                // O diff para este arquivo específico.
                "diff_snippet": "@@ -10 +10 @@\n- old_line\n+ new_line\n..."
            },
            {
                "file_path": "src/cache/redis.rs",
                "status": "Added",
                "lines_added": 40,
                "lines_removed": 0,
                "diff_snippet": "@@ -0 +1 @@\n+ impl RedisClient {\n..."
            },
            {
                "file_path": "tests/integration/user_test.rs",
                "status": "Modified",
                "lines_added": 5,
                "lines_removed": 30,
                "diff_snippet": "@@ -50,6 +50,1 @@\n..."
            }
        ],
    }
}