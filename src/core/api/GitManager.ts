import { invoke } from '@tauri-apps/api/core';

export interface Repository {
  name: string;
  last_commit_date: string;
  branch_count: number;
  current_branch: string;
}

export interface CommitStats {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
    totalChanges: number;
}

export interface FileChange {
    filePath: string;
    status: string;
    linesAdded: number;
    linesRemoved: number;
    diffSnippet: string;
}

export interface Reference {
    type: string;
    value: string;
}

export interface CommitDetails {
    hashShort: string;
    hashFull: string;
    repositoryName: string;
    repositoryPath: string;
    authorName: string;
    authorEmail: string;
    committerName: string;
    committerEmail: string;
    committerDate: string;
    messageTitle: string;
    messageBody: string;
    references: Reference[];
    branchesOnCommit: string[];
    stats: CommitStats;
    fileChanges: FileChange[];
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
    return await invoke<CommitDetails>('get_commit_details', { repoName, commitHash, path: directoryPath });
}