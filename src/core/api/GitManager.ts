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